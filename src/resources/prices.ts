import { HttpClient } from '../http-client';
import {
  CatalogPriceParams,
  CatalogPrice,
  LookupPriceRequest,
  PagePricesRequest,
  PricePage,
  PriceActionRequest,
  RequestOptions,
  UpdatePriceRequest,
} from '../types';
import { throwIfValidationErrors, validateRequired } from '../utils/validation';

/**
 * Prices resource for managing catalog prices
 */
export class Prices {
  constructor(private httpClient: HttpClient) {}

  async create(request: CatalogPriceParams): Promise<CatalogPrice> {
    return this.httpClient.postResource<CatalogPrice>('/prices/create', 'price', request);
  }

  async lookup(request: LookupPriceRequest): Promise<CatalogPrice> {
    const errors = validateRequired(request as unknown as Record<string, unknown>, ['price_id']);
    throwIfValidationErrors(errors);

    return this.httpClient.postResource<CatalogPrice>('/prices/lookup', 'price', request);
  }

  async update(request: UpdatePriceRequest): Promise<CatalogPrice> {
    const errors = validateRequired(request as unknown as Record<string, unknown>, ['price_id']);
    throwIfValidationErrors(errors);

    return this.httpClient.postResource<CatalogPrice>('/prices/update', 'price', request);
  }

  async page(request: PagePricesRequest = {}): Promise<PricePage> {
    return this.httpClient.postResource<PricePage>('/prices/page', 'page', request);
  }

  async activate(request: PriceActionRequest): Promise<CatalogPrice> {
    const errors = validateRequired(request as unknown as Record<string, unknown>, ['price_id']);
    throwIfValidationErrors(errors);

    return this.httpClient.postResource<CatalogPrice>('/prices/activate', 'price', request);
  }

  async deactivate(request: PriceActionRequest): Promise<CatalogPrice> {
    const errors = validateRequired(request as unknown as Record<string, unknown>, ['price_id']);
    throwIfValidationErrors(errors);

    return this.httpClient.postResource<CatalogPrice>('/prices/deactivate', 'price', request);
  }

  async archive(request: PriceActionRequest, options: RequestOptions = {}): Promise<CatalogPrice> {
    const errors = validateRequired(request as unknown as Record<string, unknown>, ['price_id']);
    throwIfValidationErrors(errors);

    return this.httpClient.postResource<CatalogPrice>('/prices/archive', 'price', request, {
      headers: idempotencyHeaders(options.idempotencyKey),
    });
  }
}

function idempotencyHeaders(key?: string): Record<string, string> {
  return key ? { 'Idempotency-Key': key } : {};
}
