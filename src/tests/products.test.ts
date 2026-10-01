import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Products } from '../resources/products';
import { HttpClient } from '../http-client';

describe('Products', () => {
  let products: Products;
  let httpClient: HttpClient;

  beforeEach(() => {
    httpClient = new HttpClient({ apiKey: 'test' });
    products = new Products(httpClient);
  });

  it('should create a product', async () => {
    const postSpy = vi.spyOn(httpClient, 'post').mockResolvedValue({ product: { id: 'prod_123' } });

    const result = await products.create({
      type: 'physical',
      name: 'T-Shirt',
    });

    expect(result).toEqual({ id: 'prod_123' });
    expect(postSpy).toHaveBeenCalledWith('/products/create', expect.any(Object));
  });

  it('should lookup/update and manage product state', async () => {
    const postSpy = vi.spyOn(httpClient, 'post').mockResolvedValue({
      product: { id: 'prod_123' },
      price: { id: 'pr_123' },
      page: { number: 1, size: 20, products: [] },
    });

    await products.lookup({ productId: 'prod_123' });
    await products.update({ productId: 'prod_123', name: 'New Name' });
    await products.publish({ productId: 'prod_123' });
    await products.unpublish({ productId: 'prod_123' });
    await products.archive({ productId: 'prod_123' });
    await products.addPrice({
      productId: 'prod_123',
      type: 'fixed_amount',
      fixedAmount: { currency: 'ghs', value: 5000 },
    });
    await products.setDefaultUnitPrice({ productId: 'prod_123', priceId: 'pr_123' });
    await products.page({ pageNumber: 1, pageSize: 20 });

    expect(postSpy).toHaveBeenCalledWith('/products/lookup', { productId: 'prod_123' });
    expect(postSpy).toHaveBeenCalledWith('/products/update', {
      productId: 'prod_123',
      name: 'New Name',
    });
    expect(postSpy).toHaveBeenCalledWith('/products/publish', { productId: 'prod_123' });
    expect(postSpy).toHaveBeenCalledWith('/products/unpublish', { productId: 'prod_123' });
    expect(postSpy).toHaveBeenCalledWith('/products/archive', { productId: 'prod_123' });
    expect(postSpy).toHaveBeenCalledWith('/products/add_price', {
      productId: 'prod_123',
      type: 'fixed_amount',
      fixedAmount: { currency: 'ghs', value: 5000 },
    });
    expect(postSpy).toHaveBeenCalledWith('/products/set_default_unit_price', {
      productId: 'prod_123',
      priceId: 'pr_123',
    });
    expect(postSpy).toHaveBeenCalledWith('/products/page', { pageNumber: 1, pageSize: 20 });
  });
});
