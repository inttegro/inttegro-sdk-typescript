import { HttpClient } from '../http-client';
import {
  CreateCustomerRequest,
  Customer,
  CustomerPage,
  LookupCustomerRequest,
  PageCustomersRequest,
  RequestOptions,
  ResourceSearchPage,
  ResourceSearchRequest,
  UpdateCustomerRequest,
} from '../types';
import { throwIfValidationErrors, validateRequired } from '../utils/validation';

/**
 * Customers resource for creating and managing customer records
 */
export class Customers {
  constructor(private httpClient: HttpClient) {}

  async create(request: CreateCustomerRequest): Promise<Customer> {
    const errors = validateRequired(request as unknown as Record<string, unknown>, ['name']);
    throwIfValidationErrors(errors);

    return this.httpClient.postResource<Customer>('/customers/create', 'customer', request);
  }

  async lookup(request: LookupCustomerRequest): Promise<Customer> {
    const errors = validateRequired(request as unknown as Record<string, unknown>, ['customer_id']);
    throwIfValidationErrors(errors);

    return this.httpClient.postResource<Customer>('/customers/lookup', 'customer', request);
  }

  async update(request: UpdateCustomerRequest, options: RequestOptions = {}): Promise<Customer> {
    const errors = validateRequired(request as unknown as Record<string, unknown>, ['customer_id']);
    throwIfValidationErrors(errors);

    return this.httpClient.postResource<Customer>('/customers/update', 'customer', request, {
      headers: idempotencyHeaders(options.idempotencyKey),
    });
  }

  async page(request: PageCustomersRequest = {}): Promise<CustomerPage> {
    return this.httpClient.postResource<CustomerPage>('/customers/page', 'page', request);
  }

  async search(request: ResourceSearchRequest): Promise<ResourceSearchPage> {
    return this.httpClient.postResource<ResourceSearchPage>('/customers/search', 'search', request);
  }
}

function idempotencyHeaders(key?: string): Record<string, string> {
  return key ? { 'Idempotency-Key': key } : {};
}
