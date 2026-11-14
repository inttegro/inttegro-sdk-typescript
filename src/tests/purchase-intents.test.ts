import { beforeEach, describe, expect, it, vi } from 'vitest';

import { HttpClient } from '../http-client';
import { PurchaseIntents } from '../resources/purchase-intents';
import type { PurchaseIntent } from '../types';

describe('PurchaseIntents', () => {
  let purchaseIntents: PurchaseIntents;
  let httpClient: HttpClient;

  beforeEach(() => {
    httpClient = new HttpClient({ apiKey: 'test' });
    purchaseIntents = new PurchaseIntents(httpClient);
  });

  it('should create a purchase intent', async () => {
    const intent = {
      allowVariants: false,
      createdAt: '2026-09-09T12:00:00Z',
      id: 'sale_123',
      merchant: { organizationName: 'Tea House Ltd' },
      product: {
        active: true,
        createdAt: '2026-09-09T11:00:00Z',
        dimensions: { digital: { bytes: 1024 } },
        id: 'prod_123',
        name: 'Tea guide',
        type: 'digital',
      },
      quantity: { min: 1 },
      status: 'active',
      usage: {
        order: { createdAt: '2026-09-09T12:02:00Z', id: 'or_123' },
        singleUse: true,
      },
    } satisfies PurchaseIntent;
    const mockResponse = { purchaseIntent: intent };
    const postSpy = vi.spyOn(httpClient, 'post').mockResolvedValue(mockResponse);

    const request = {
      productId: 'prod_123',
      priceId: 'pr_123',
      quantity: { min: 1 },
    };

    const result = await purchaseIntents.create(request);

    expect(result).toEqual(mockResponse.purchaseIntent);
    expect(result.merchant?.organizationName).toBe('Tea House Ltd');
    expect(result.product?.dimensions?.digital?.bytes).toBe(1024);
    expect(result.usage.order?.id).toBe('or_123');
    expect(postSpy).toHaveBeenCalledWith('/purchase_intents/create', request);
  });

  it('should update, cancel, lookup, and page purchase intents', async () => {
    const mockResponse = {
      purchaseIntent: { id: 'sale_123' },
      page: { number: 1, size: 20, purchaseIntents: [] },
    };
    const postSpy = vi.spyOn(httpClient, 'post').mockResolvedValue(mockResponse);

    await purchaseIntents.update({ id: 'sale_123', quantity: { min: 1, max: 3 } });
    await purchaseIntents.cancel({ id: 'sale_123' });
    await purchaseIntents.lookup({ id: 'sale_123' });
    const result = await purchaseIntents.page({ pageNumber: 1, pageSize: 20 });

    expect(result).toEqual(mockResponse.page);
    expect(postSpy).toHaveBeenCalledWith('/purchase_intents/update', {
      id: 'sale_123',
      quantity: { min: 1, max: 3 },
    });
    expect(postSpy).toHaveBeenCalledWith('/purchase_intents/cancel', { id: 'sale_123' });
    expect(postSpy).toHaveBeenCalledWith('/purchase_intents/lookup', { id: 'sale_123' });
    expect(postSpy).toHaveBeenCalledWith('/purchase_intents/page', {
      pageNumber: 1,
      pageSize: 20,
    });
  });

  it('should validate required selectors on create', async () => {
    await expect(
      purchaseIntents.create({
        quantity: { min: 1, max: 5 },
      } as never)
    ).rejects.toThrow('Validation failed');

    const ambiguousRequest = {
      productId: 'prod_123',
      bundleId: 'pbd_123',
      priceId: 'pr_123',
      quantity: { min: 1 },
    } as never;
    await expect(purchaseIntents.create(ambiguousRequest)).rejects.toThrow(
      'Exactly one product or bundle selector must be provided'
    );
  });

  it('creates bundle purchase intents with a catalog default or offer override', async () => {
    const bundlePrice = {
      active: true,
      nominal: { currency: 'ghs', value: 3200 },
    } satisfies NonNullable<PurchaseIntent['bundle']>['price'];
    const bundle = {
      components: [{ name: 'Tea guide', quantity: 1 }],
      id: 'pbd_123',
      name: 'Tea collection',
      price: bundlePrice,
    } satisfies NonNullable<PurchaseIntent['bundle']>;
    const intent = {
      allowVariants: false,
      bundle,
      createdAt: '2026-11-14T00:00:00Z',
      id: 'sale_bundle',
      quantity: { min: 1 },
      status: 'active',
      usage: { multiUse: true },
    } satisfies PurchaseIntent;
    const postSpy = vi.spyOn(httpClient, 'post').mockResolvedValue({ purchaseIntent: intent });
    const request = {
      bundle: { id: 'pbd_123' },
      quantity: { min: 1 },
    };

    await expect(purchaseIntents.create(request)).resolves.toEqual(intent);
    expect(postSpy).toHaveBeenCalledWith('/purchase_intents/create', request);

    const offerRequest = {
      bundleId: 'pbd_123',
      price: { nominal: { currency: 'ghs', value: 2400 } },
      quantity: { min: 1 },
    } as const;
    await expect(purchaseIntents.create(offerRequest)).resolves.toEqual(intent);
    expect(postSpy).toHaveBeenCalledWith('/purchase_intents/create', offerRequest);

    await expect(
      purchaseIntents.create({
        bundleId: 'pbd_123',
        priceId: 'pr_offer',
        price: { nominal: { currency: 'ghs', value: 2400 } },
        quantity: { min: 1 },
      } as never)
    ).rejects.toThrow('Provide at most one price or priceId for a bundle');
  });
});
