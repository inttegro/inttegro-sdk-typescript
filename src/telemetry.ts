import {
  context,
  propagation,
  Span,
  SpanKind,
  SpanStatusCode,
  trace,
  type Attributes,
  type TextMapSetter,
  type Tracer,
} from '@opentelemetry/api';
import type { TelemetryConfig } from './config';
import type { ErrorReportingConfig } from './error-reporting';
import { createErrorReport, shouldReport, submitErrorReport } from './error-reporting';
import { InttegroAPIError, InttegroNetworkError } from './errors';

const INSTRUMENTATION_NAME = '@inttegro/inttegro-sdk';
const SAFE_RESOURCES = new Set([
  'apps',
  'balance_transactions',
  'balances',
  'broadcasts',
  'checkout',
  'chimes',
  'customers',
  'file_links',
  'file_references',
  'files',
  'financial_accounts',
  'keys',
  'message_templates',
  'orders',
  'otp',
  'payment_methods',
  'payouts',
  'ping',
  'prices',
  'products',
  'purchase_intents',
  'refunds',
  'schedules',
  'sessions',
  'spec',
  'upload_requests',
]);
const SAFE_ACTIONS = new Set([
  'activate',
  'add_price',
  'archive',
  'broadcast',
  'cancel',
  'complete',
  'confirm_payment',
  'confirm_verification',
  'connect',
  'contents',
  'countries',
  'create',
  'deactivate',
  'delete',
  'destroy',
  'disable',
  'disable_fx',
  'disable_pull',
  'disable_push',
  'disactivate',
  'disconnect',
  'enable',
  'enable_fx',
  'enable_pull',
  'enable_push',
  'finalize',
  'generate',
  'initiate',
  'lookup',
  'new',
  'open',
  'page',
  'pay',
  'publish',
  'reconcile',
  'reconnect',
  'refund',
  'render_preview',
  'request_confirmation',
  'review',
  'revoke',
  'schedule',
  'search',
  'send',
  'send_invoice',
  'send_receipt',
  'set_default_unit_price',
  'set_destinations',
  'settings',
  'tokenize',
  'unarchive',
  'unpublish',
  'update',
  'upload',
  'usage',
  'verify',
]);

const headerSetter: TextMapSetter<Record<string, string>> = {
  set(carrier, key, value) {
    // An explicitly supplied distributed-tracing header belongs to the caller.
    if (!Object.keys(carrier).some((candidate) => candidate.toLowerCase() === key.toLowerCase())) {
      carrier[key] = value;
    }
  },
};

export class Telemetry {
  private readonly enabled: boolean;
  private readonly tracer: Tracer;
  private readonly errorReporting?: ErrorReportingConfig;

  constructor(
    config: TelemetryConfig | undefined,
    version: string,
    errorReporting?: ErrorReportingConfig
  ) {
    this.enabled = config?.enabled !== false;
    this.errorReporting = errorReporting;
    const provider = config?.tracerProvider ?? trace.getTracerProvider();
    this.tracer = provider.getTracer(INSTRUMENTATION_NAME, version);
  }

  async request<T>(
    pathOrUrl: string,
    method: string,
    baseUrl: string,
    version: string,
    operation: (span: Span | undefined) => Promise<T>,
    operationOverride?: string
  ): Promise<T> {
    if (!this.enabled && !this.errorReporting) return operation(undefined);

    const details = requestDetails(pathOrUrl, baseUrl, operationOverride);
    const startedAt = this.errorReporting ? performance.now() : undefined;
    const attributes: Attributes = {
      'inttegro.operation.name': details.operation,
      'inttegro.sdk.language': 'typescript',
      'inttegro.sdk.version': version,
      'http.request.method': method.toUpperCase(),
      'server.address': details.serverAddress,
    };
    if (details.route) attributes['url.template'] = details.route;

    const run = async (span: Span | undefined): Promise<T> => {
      try {
        return await operation(span);
      } catch (error) {
        const errorType = classifyError(error);
        span?.setAttribute('error.type', errorType);
        span?.setStatus({ code: SpanStatusCode.ERROR });
        span?.addEvent('inttegro.request.failed', { 'error.type': errorType });
        const reporting = this.errorReporting;
        if (reporting) {
          try {
            if (shouldReport(error, errorType, reporting.policy ?? 'unexpected')) {
              const report = createErrorReport({
                error,
                category: errorType,
                operation: details.operation,
                method,
                route: details.route,
                serverAddress: details.serverAddress,
                version,
                durationMs: performance.now() - (startedAt ?? performance.now()),
                span,
              });
              if (error instanceof InttegroAPIError || error instanceof InttegroNetworkError) {
                error.report = report;
              }
              submitErrorReport(reporting.reporter, report);
            }
          } catch {
            // Report preparation must never replace the operation's original failure.
          }
        }
        throw error;
      } finally {
        span?.end();
      }
    };

    if (!this.enabled) return run(undefined);

    return this.tracer.startActiveSpan(
      `inttegro.${details.operation}`,
      { kind: SpanKind.CLIENT, attributes },
      run
    );
  }

  inject(headers: Record<string, string>): void {
    if (!this.enabled) return;
    propagation.inject(context.active(), headers, headerSetter);
  }
}

function requestDetails(
  pathOrUrl: string,
  baseUrl: string,
  operationOverride?: string
): { operation: string; route?: string; serverAddress: string } {
  const base = new URL(baseUrl);
  const url = new URL(pathOrUrl, base);
  const isStaticApiRoute = !/^https?:\/\//i.test(pathOrUrl);
  const segments = isStaticApiRoute ? url.pathname.split('/').filter(Boolean) : [];
  const resource = segments[0];
  const action = segments[1];
  const knownRoute =
    isStaticApiRoute &&
    segments.length > 0 &&
    segments.length <= 2 &&
    resource !== undefined &&
    SAFE_RESOURCES.has(resource) &&
    (action === undefined || SAFE_ACTIONS.has(action));
  const route = knownRoute ? url.pathname : undefined;
  const derivedOperation = knownRoute
    ? `${resource}.${action ?? (resource === 'balances' ? 'lookup' : 'request')}`
    : 'http.request';
  return {
    operation: operationOverride ?? derivedOperation,
    route,
    serverAddress: url.hostname,
  };
}

function classifyError(error: unknown): string {
  if (error instanceof InttegroNetworkError) return error.isTimeout ? 'timeout' : 'network_error';
  if (error instanceof InttegroAPIError && error.statusCode) return `http_${error.statusCode}`;
  if (error instanceof SyntaxError) return 'decode_error';
  return 'unknown_error';
}
