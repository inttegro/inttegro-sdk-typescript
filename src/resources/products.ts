import { HttpClient } from '../http-client';
import {
  AddProductPriceRequest,
  CreateProductRequest,
  LookupProductRequest,
  PageProductsRequest,
  Product,
  ProductDefaultUnitPrice,
  ProductPage,
  ProductActionRequest,
  ResourceSearchPage,
  ResourceSearchRequest,
  SetDefaultUnitPriceRequest,
  UpdateProductRequest,
} from '../types';
import { throwIfValidationErrors, validateRequired } from '../utils/validation';

/**
 * Products resource for managing catalog items
 */
export class Products {
  constructor(private httpClient: HttpClient) {}

  async create(request: CreateProductRequest): Promise<Product> {
    const errors = validateRequired(request as unknown as Record<string, unknown>, [
      'type',
      'name',
    ]);
    throwIfValidationErrors(errors);

    return this.httpClient.postResource<Product>('/products/create', 'product', request);
  }

  async addPrice(request: AddProductPriceRequest): Promise<ProductDefaultUnitPrice> {
    const errors = validateRequired(request as unknown as Record<string, unknown>, [
      'product_id',
      'amount',
    ]);
    throwIfValidationErrors(errors);

    return this.httpClient.postResource<ProductDefaultUnitPrice>(
      '/products/add_price',
      'price',
      request
    );
  }

  async setDefaultUnitPrice(request: SetDefaultUnitPriceRequest): Promise<Product> {
    const errors = validateRequired(request as unknown as Record<string, unknown>, [
      'product_id',
      'price_id',
    ]);
    throwIfValidationErrors(errors);

    return this.httpClient.postResource<Product>(
      '/products/set_default_unit_price',
      'product',
      request
    );
  }

  async lookup(request: LookupProductRequest): Promise<Product> {
    const errors = validateRequired(request as unknown as Record<string, unknown>, ['product_id']);
    throwIfValidationErrors(errors);

    return this.httpClient.postResource<Product>('/products/lookup', 'product', request);
  }

  async update(request: UpdateProductRequest): Promise<Product> {
    const errors = validateRequired(request as unknown as Record<string, unknown>, ['product_id']);
    throwIfValidationErrors(errors);

    return this.httpClient.postResource<Product>('/products/update', 'product', request);
  }

  async publish(request: ProductActionRequest): Promise<Product> {
    const errors = validateRequired(request as unknown as Record<string, unknown>, ['product_id']);
    throwIfValidationErrors(errors);

    return this.httpClient.postResource<Product>('/products/publish', 'product', request);
  }

  async unpublish(request: ProductActionRequest): Promise<Product> {
    const errors = validateRequired(request as unknown as Record<string, unknown>, ['product_id']);
    throwIfValidationErrors(errors);

    return this.httpClient.postResource<Product>('/products/unpublish', 'product', request);
  }

  async archive(request: ProductActionRequest): Promise<Product> {
    const errors = validateRequired(request as unknown as Record<string, unknown>, ['product_id']);
    throwIfValidationErrors(errors);

    return this.httpClient.postResource<Product>('/products/archive', 'product', request);
  }

  async page(request: PageProductsRequest = {}): Promise<ProductPage> {
    return this.httpClient.postResource<ProductPage>('/products/page', 'page', request);
  }

  async search(request: ResourceSearchRequest): Promise<ResourceSearchPage> {
    return this.httpClient.postResource<ResourceSearchPage>('/products/search', 'search', request);
  }
}
