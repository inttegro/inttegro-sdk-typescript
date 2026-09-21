/**
 * HTTP client for making API requests
 */

import {
  InttegroConfig,
  DEFAULT_CONFIG,
  RequestInterceptor,
  ResponseInterceptor,
  ResolvedInttegroConfig,
  RetryConfig,
} from './config';
import {
  InttegroAPIError,
  InttegroAuthenticationError,
  InttegroNetworkError,
  InttegroRateLimitError,
  APIErrorDocument,
} from './errors';
import { Logger } from './utils/logger';
import { withRetry, isRetryableHttpError } from './utils/retry';
import { generateIdempotencyKey } from './utils/idempotency';
import { serializeRequestBody, toCamelCase, toPublicValue } from './utils/casing';
import type { Span } from '@opentelemetry/api';
import { Telemetry } from './telemetry';
import { SDK_VERSION } from './version';

export type ResponseMeta = Record<string, unknown>;

export interface InttegroResponse<T> {
  data: T;
  status: number;
  headers: Headers;
  requestId?: string;
  retryAfter?: string;
  meta?: ResponseMeta;
}

/**
 * HTTP client for making requests to the Inttegro API
 */
export class HttpClient {
  private config: ResolvedInttegroConfig;
  private logger: Logger;
  private telemetry: Telemetry;

  constructor(config: InttegroConfig) {
    this.config = {
      ...DEFAULT_CONFIG,
      ...config,
      retry: {
        ...DEFAULT_CONFIG.retry,
        ...config.retry,
      },
      telemetry: {
        ...DEFAULT_CONFIG.telemetry,
        ...config.telemetry,
      },
    };
    this.logger = new Logger(this.config.debug);
    this.telemetry = new Telemetry(this.config.telemetry, SDK_VERSION, this.config.errorReporting);
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<InttegroConfig>): void {
    this.config = {
      ...this.config,
      ...config,
      retry: {
        ...this.config.retry,
        ...config.retry,
      },
      telemetry: {
        ...this.config.telemetry,
        ...config.telemetry,
      },
    };
    this.logger.setEnabled(this.config.debug);
    this.telemetry = new Telemetry(this.config.telemetry, SDK_VERSION, this.config.errorReporting);
  }

  /**
   * Add request interceptor
   */
  addRequestInterceptor(interceptor: RequestInterceptor): void {
    this.config.requestInterceptors.push(interceptor);
  }

  /**
   * Add response interceptor
   */
  addResponseInterceptor(interceptor: ResponseInterceptor): void {
    this.config.responseInterceptors.push(interceptor);
  }

  /**
   * Make a request with timeout
   */
  private async fetchWithTimeout(url: string, options: RequestInit): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof Error && error.name === 'AbortError') {
        throw new InttegroNetworkError(
          `Request timeout after ${this.config.timeout}ms`,
          error,
          true
        );
      }

      throw new InttegroNetworkError(
        'Network request failed',
        error instanceof Error ? error : undefined
      );
    }
  }

  /**
   * Apply request interceptors
   */
  private async applyRequestInterceptors(
    url: string,
    options: RequestInit
  ): Promise<{ url: string; options: RequestInit }> {
    let currentUrl = url;
    let currentOptions = options;

    for (const interceptor of this.config.requestInterceptors) {
      const result = await interceptor(currentUrl, currentOptions);
      currentUrl = result.url;
      currentOptions = result.options;
    }

    return { url: currentUrl, options: currentOptions };
  }

  /**
   * Apply response interceptors
   */
  private async applyResponseInterceptors(response: Response): Promise<Response> {
    let currentResponse = response;

    for (const interceptor of this.config.responseInterceptors) {
      currentResponse = await interceptor(currentResponse);
    }

    return currentResponse;
  }

  /**
   * Parse error response
   */
  private async parseErrorResponse(response: Response): Promise<APIErrorDocument> {
    try {
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return toPublicValue(await response.json()) as APIErrorDocument;
      }
      return { message: await response.text() };
    } catch {
      return { message: `HTTP ${response.status}: ${response.statusText}` };
    }
  }

  /**
   * Handle error response
   */
  private async handleErrorResponse(response: Response): Promise<never> {
    const errorData = await this.parseErrorResponse(response);
    const payload = errorData.error ?? errorData;
    const requestId = response.headers.get('x-request-id') ?? undefined;

    // Handle authentication errors
    if (response.status === 401) {
      throw new InttegroAuthenticationError(
        payload.message || payload.detail || errorData.message || 'Authentication failed',
        response.status,
        payload.code || errorData.code,
        payload.type,
        payload.url,
        payload.detail,
        payload.fixCode,
        payload.cause,
        errorData,
        requestId
      );
    }

    // Handle rate limiting
    if (response.status === 429) {
      const retryAfter = response.headers.get('retry-after');
      throw new InttegroRateLimitError(
        payload.message || payload.detail || errorData.message || 'Rate limit exceeded',
        response.status,
        retryAfter ? parseInt(retryAfter, 10) : undefined,
        payload.code || errorData.code,
        payload.type,
        payload.url,
        payload.detail,
        payload.fixCode,
        payload.cause,
        errorData,
        requestId
      );
    }

    // Handle other errors
    throw InttegroAPIError.fromResponse(response.status, errorData, requestId);
  }

  /**
   * Make an API request
   */
  async request<T>(path: string, options: RequestInit = {}, skipRetry = false): Promise<T> {
    return (await this.requestWithResponse<T>(path, options, skipRetry)).data;
  }

  /**
   * Make an API request and return the decoded value with response metadata.
   */
  async requestWithResponse<T>(
    path: string,
    options: RequestInit = {},
    skipRetry = false
  ): Promise<InttegroResponse<T>> {
    const method = (options.method || 'GET').toUpperCase();
    return this.telemetry.request(path, method, this.config.baseUrl, SDK_VERSION, async (span) => {
      const url = `${this.config.baseUrl}${path}`;
      const requestOptionsWithIdempotency = this.withIdempotency(path, options);
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.config.apiKey}`,
        'User-Agent': `inttegro-sdk-typescript/${SDK_VERSION}`,
        ...normalizeHeaders(requestOptionsWithIdempotency.headers),
      };

      let requestOptions: RequestInit = { ...requestOptionsWithIdempotency, headers };
      const interceptedRequest = await this.applyRequestInterceptors(url, requestOptions);
      const finalUrl = interceptedRequest.url;
      requestOptions = interceptedRequest.options;
      const propagatedHeaders = normalizeHeaders(requestOptions.headers);
      this.telemetry.inject(propagatedHeaders);
      requestOptions = { ...requestOptions, headers: propagatedHeaders };
      span?.addEvent('inttegro.request.prepared');

      this.logger.debug(`Making ${requestOptions.method || 'GET'} request to ${finalUrl}`);

      const makeRequest = async (resendCount: number): Promise<InttegroResponse<T>> => {
        span?.addEvent('inttegro.http.attempt.started', {
          'http.request.resend_count': resendCount,
        });
        const response = await this.fetchWithTimeout(finalUrl, requestOptions);
        const interceptedResponse = await this.applyResponseInterceptors(response);
        span?.setAttribute('http.response.status_code', interceptedResponse.status);
        const requestId = interceptedResponse.headers.get('x-request-id');
        if (requestId) span?.setAttribute('inttegro.request.id', requestId);
        span?.addEvent('inttegro.response.received', {
          'http.response.status_code': interceptedResponse.status,
          'http.request.resend_count': resendCount,
        });

        if (!interceptedResponse.ok) await this.handleErrorResponse(interceptedResponse);

        const contentType = interceptedResponse.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const value = toPublicValue(await interceptedResponse.json()) as T;
          span?.addEvent('inttegro.response.decoded');
          return responseEnvelope(value, interceptedResponse);
        }
        span?.addEvent('inttegro.response.decoded');
        return responseEnvelope({} as T, interceptedResponse);
      };

      if (skipRetry) return makeRequest(0);
      return withRetry(
        makeRequest,
        this.config.retry as Required<RetryConfig>,
        this.logger,
        isRetryableHttpError,
        ({ resendCount, delayMs, error }) => {
          span?.addEvent('inttegro.retry.scheduled', {
            'http.request.resend_count': resendCount,
            'inttegro.retry.delay_ms': delayMs,
            'error.type': retryErrorType(error),
          });
        }
      );
    });
  }

  /**
   * Make a raw request and return the Response for binary or multipart flows.
   */
  async raw(
    pathOrUrl: string,
    options: RequestInit = {},
    authenticated = true,
    operationOverride?: string
  ): Promise<Response> {
    return this.rawWithTransform(
      pathOrUrl,
      options,
      authenticated,
      operationOverride,
      async (response) => response
    );
  }

  private async rawWithTransform<T>(
    pathOrUrl: string,
    options: RequestInit,
    authenticated: boolean,
    operationOverride: string | undefined,
    transform: (response: Response, span: Span | undefined) => Promise<T>
  ): Promise<T> {
    const method = (options.method || 'GET').toUpperCase();
    return this.telemetry.request(
      pathOrUrl,
      method,
      this.config.baseUrl,
      SDK_VERSION,
      async (span) => {
        const url = pathOrUrl.startsWith('http') ? pathOrUrl : `${this.config.baseUrl}${pathOrUrl}`;
        const requestOptionsWithIdempotency = authenticated
          ? this.withIdempotency(pathOrUrl, options, { body: false, header: true })
          : options;
        const headers: Record<string, string> = {
          Accept: 'application/json',
          'User-Agent': `inttegro-sdk-typescript/${SDK_VERSION}`,
          ...(authenticated ? { Authorization: `Bearer ${this.config.apiKey}` } : {}),
          ...normalizeHeaders(requestOptionsWithIdempotency.headers),
        };

        let requestOptions: RequestInit = { ...requestOptionsWithIdempotency, headers };
        const interceptedRequest = await this.applyRequestInterceptors(url, requestOptions);
        const finalUrl = interceptedRequest.url;
        requestOptions = interceptedRequest.options;
        const propagatedHeaders = normalizeHeaders(requestOptions.headers);
        this.telemetry.inject(propagatedHeaders);
        requestOptions = { ...requestOptions, headers: propagatedHeaders };
        span?.addEvent('inttegro.request.prepared');
        span?.addEvent('inttegro.http.attempt.started', { 'http.request.resend_count': 0 });

        const response = await this.fetchWithTimeout(finalUrl, requestOptions);
        const interceptedResponse = await this.applyResponseInterceptors(response);
        span?.setAttribute('http.response.status_code', interceptedResponse.status);
        const requestId = interceptedResponse.headers.get('x-request-id');
        if (requestId) span?.setAttribute('inttegro.request.id', requestId);
        span?.addEvent('inttegro.response.received', {
          'http.response.status_code': interceptedResponse.status,
          'http.request.resend_count': 0,
        });

        if (!interceptedResponse.ok) await this.handleErrorResponse(interceptedResponse);
        return transform(interceptedResponse, span);
      },
      operationOverride
    );
  }

  /**
   * Make a multipart/form-data POST request.
   */
  async postForm<T>(
    pathOrUrl: string,
    form: FormData,
    options: RequestInit = {},
    authenticated = true,
    operationOverride?: string
  ): Promise<T> {
    return this.rawWithTransform(
      pathOrUrl,
      {
        ...options,
        method: 'POST',
        body: form,
      },
      authenticated,
      operationOverride,
      async (response, span) => {
        const value = toPublicValue(await response.json()) as T;
        span?.addEvent('inttegro.response.decoded');
        return value;
      }
    );
  }

  /**
   * Make a GET request
   */
  async get<T>(path: string, options: RequestInit = {}): Promise<T> {
    return this.request<T>(path, { ...options, method: 'GET' });
  }

  /**
   * Make a GET request and return the decoded value with response metadata.
   */
  async getWithResponse<T>(path: string, options: RequestInit = {}): Promise<InttegroResponse<T>> {
    return this.requestWithResponse<T>(path, { ...options, method: 'GET' });
  }

  /**
   * Make a POST request
   */
  async post<T>(path: string, body?: unknown, options: RequestInit = {}): Promise<T> {
    return this.request<T>(path, {
      ...options,
      method: 'POST',
      body: body === undefined ? undefined : serializeRequestBody(body),
    });
  }

  /**
   * Make a POST request and return the decoded value with response metadata.
   */
  async postWithResponse<T>(
    path: string,
    body?: unknown,
    options: RequestInit = {}
  ): Promise<InttegroResponse<T>> {
    return this.requestWithResponse<T>(path, {
      ...options,
      method: 'POST',
      body: body === undefined ? undefined : serializeRequestBody(body),
    });
  }

  /**
   * Make a POST request and return one domain value from the wire envelope.
   * Transport envelopes are deliberately kept out of the public resource API.
   */
  async postResource<T>(
    path: string,
    field: string,
    body?: unknown,
    options: RequestInit = {}
  ): Promise<T> {
    const envelope = Object.keys(options).length
      ? await this.post<Record<string, unknown>>(path, body, options)
      : await this.post<Record<string, unknown>>(path, body);
    return resourceFromEnvelope<T>(envelope, field, path);
  }

  /**
   * Make a POST request and return one domain value plus response metadata.
   */
  async postResourceWithResponse<T>(
    path: string,
    field: string,
    body?: unknown,
    options: RequestInit = {}
  ): Promise<InttegroResponse<T>> {
    const response = Object.keys(options).length
      ? await this.postWithResponse<Record<string, unknown>>(path, body, options)
      : await this.postWithResponse<Record<string, unknown>>(path, body);
    return {
      ...response,
      data: resourceFromEnvelope<T>(response.data, field, path),
    };
  }

  /** Extract one domain value from a multipart response envelope. */
  async postFormResource<T>(
    pathOrUrl: string,
    field: string,
    form: FormData,
    options: RequestInit = {},
    authenticated = true
  ): Promise<T> {
    const envelope = await this.postForm<Record<string, unknown>>(
      pathOrUrl,
      form,
      options,
      authenticated
    );
    return resourceFromEnvelope<T>(envelope, field, pathOrUrl);
  }

  /**
   * Make a PUT request
   */
  async put<T>(path: string, body?: unknown, options: RequestInit = {}): Promise<T> {
    return this.request<T>(path, {
      ...options,
      method: 'PUT',
      body: body === undefined ? undefined : serializeRequestBody(body),
    });
  }

  /**
   * Make a PATCH request
   */
  async patch<T>(path: string, body?: unknown, options: RequestInit = {}): Promise<T> {
    return this.request<T>(path, {
      ...options,
      method: 'PATCH',
      body: body === undefined ? undefined : serializeRequestBody(body),
    });
  }

  /**
   * Make a DELETE request
   */
  async delete<T>(path: string, options: RequestInit = {}): Promise<T> {
    return this.request<T>(path, { ...options, method: 'DELETE' });
  }

  private withIdempotency(
    path: string,
    options: RequestInit,
    mode: { body: boolean; header: boolean } = { body: true, header: false }
  ): RequestInit {
    const method = (options.method || 'GET').toUpperCase();
    if (method !== 'POST') {
      return options;
    }

    const headers = normalizeHeaders(options.headers);
    const requestOptions: RequestInit = { ...options, headers };
    if (mode.body && typeof requestOptions.body === 'string') {
      requestOptions.body = stripTopLevelIdempotencyKey(requestOptions.body);
    }
    if (!isIdempotentMutationPath(path)) {
      return requestOptions;
    }

    const existingHeader = findHeader(headers, 'Idempotency-Key');
    if (existingHeader) {
      return requestOptions;
    }

    if (mode.body && typeof requestOptions.body === 'string') {
      const body = addRequestMetaIdempotencyKey(requestOptions.body);
      return { ...requestOptions, body };
    }

    if (mode.header && !existingHeader) {
      headers['Idempotency-Key'] = generateIdempotencyKey();
      return { ...requestOptions, headers };
    }

    return requestOptions;
  }
}

function resourceFromEnvelope<T>(
  envelope: Record<string, unknown>,
  field: string,
  path: string
): T {
  const publicField = toCamelCase(field);
  const resource = envelope[publicField];
  if (resource === undefined || resource === null) {
    throw new TypeError(`Inttegro returned an invalid ${field} value for ${path}`);
  }
  return resource as T;
}

function responseEnvelope<T>(data: T, response: Response): InttegroResponse<T> {
  const requestId = response.headers.get('x-request-id') ?? undefined;
  const retryAfter = response.headers.get('retry-after') ?? undefined;
  const meta = responseMetaFrom(data);
  return {
    data,
    status: response.status,
    headers: response.headers,
    requestId,
    retryAfter,
    meta,
  };
}

function responseMetaFrom(value: unknown): ResponseMeta | undefined {
  if (!isRecord(value)) {
    return undefined;
  }
  const meta = value.responseMeta ?? value.response_meta;
  return isRecord(meta) ? meta : undefined;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function retryErrorType(error: unknown): string {
  if (error instanceof InttegroNetworkError) return error.isTimeout ? 'timeout' : 'network_error';
  if (error instanceof InttegroAPIError && error.statusCode) return `http_${error.statusCode}`;
  if (error instanceof SyntaxError) return 'decode_error';
  return 'unknown_error';
}

function stripTopLevelIdempotencyKey(body: string): string {
  try {
    const payload = JSON.parse(body) as unknown;
    if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
      return body;
    }
    const record = payload as Record<string, unknown>;
    delete record.idempotency_key;
    return JSON.stringify(record);
  } catch {
    return body;
  }
}

function addRequestMetaIdempotencyKey(body: string): string {
  try {
    const payload = JSON.parse(body) as unknown;
    if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
      return body;
    }
    const record = payload as Record<string, unknown>;
    delete record.idempotency_key;
    const requestMeta =
      record.request_meta &&
      typeof record.request_meta === 'object' &&
      !Array.isArray(record.request_meta)
        ? { ...(record.request_meta as Record<string, unknown>) }
        : {};
    if (typeof requestMeta.idempotency_key === 'string' && requestMeta.idempotency_key.trim()) {
      return body;
    }
    return JSON.stringify({
      ...record,
      request_meta: {
        ...requestMeta,
        idempotency_key: generateIdempotencyKey(),
      },
    });
  } catch {
    return body;
  }
}

function normalizeHeaders(headers: RequestInit['headers'] | undefined): Record<string, string> {
  if (!headers) return {};
  if (typeof Headers !== 'undefined' && headers instanceof Headers) {
    return Object.fromEntries(headers.entries());
  }
  if (Array.isArray(headers)) {
    return Object.fromEntries(headers);
  }
  return { ...(headers as Record<string, string>) };
}

function findHeader(headers: Record<string, string>, name: string): string | undefined {
  const lowerName = name.toLowerCase();
  const match = Object.entries(headers).find(
    ([key, value]) => key.toLowerCase() === lowerName && value.trim()
  );
  return match?.[1];
}

function isIdempotentMutationPath(pathOrUrl: string): boolean {
  let path = pathOrUrl;
  if (pathOrUrl.startsWith('http')) {
    try {
      path = new URL(pathOrUrl).pathname;
    } catch {
      return false;
    }
  }
  const parts = path.split('/').filter(Boolean);
  const action = parts[parts.length - 1];
  if (!action) return false;
  return !new Set([
    'lookup',
    'page',
    'search',
    'settings',
    'countries',
    'contents',
    'balances',
    'render_preview',
    'usage',
  ]).has(action);
}
