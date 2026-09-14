import { beforeEach, describe, expect, it, vi } from 'vitest';

import { HttpClient } from '../http-client';
import { Refunds } from '../resources/refunds';
import { RefundFailureReasons, type Refund } from '../types';

describe('Refunds', () => {
  let refunds: Refunds;
  let httpClient: HttpClient;

  beforeEach(() => {
    httpClient = new HttpClient({ apiKey: 'test' });
    refunds = new Refunds(httpClient);
  });

  it('should create, cancel, look up, and page refunds', async () => {
    const response = {
      refund: { id: 'rf_123' },
      page: { number: 1, size: 20, refunds: [] },
    };
    const postSpy = vi.spyOn(httpClient, 'post').mockResolvedValue(response);

    await refunds.create(
      {
        lineItems: [
          {
            orderLineItemId: 'oli_123',
            refundAmount: { currency: 'ghs', value: 2500 },
          },
        ],
        orderId: 'or_123',
        reason: 'requested_by_customer',
      },
      { idempotencyKey: 'idem_refund_create' }
    );
    await refunds.cancel(
      { refundId: 'rf_123', reason: 'Customer no longer wants the refund' },
      { idempotencyKey: 'idem_refund_cancel' }
    );
    await refunds.lookup({ refundId: 'rf_123' });
    await refunds.page({ pageNumber: 1, pageSize: 20 });

    expect(postSpy).toHaveBeenCalledWith('/refunds/create', expect.any(Object), {
      headers: { 'Idempotency-Key': 'idem_refund_create' },
    });
    expect(postSpy).toHaveBeenCalledWith(
      '/refunds/cancel',
      { refundId: 'rf_123', reason: 'Customer no longer wants the refund' },
      { headers: { 'Idempotency-Key': 'idem_refund_cancel' } }
    );
    expect(postSpy).toHaveBeenCalledWith('/refunds/lookup', { refundId: 'rf_123' });
    expect(postSpy).toHaveBeenCalledWith('/refunds/page', { pageNumber: 1, pageSize: 20 });
  });
});

describe('Refund failure contract', () => {
  it('exposes stable sanitized failure reasons including the fail-closed fallback', () => {
    const refund = {
      failure: {
        reason: RefundFailureReasons.Unknown,
        detail: 'The refund could not be completed.',
        retryable: false,
      },
    } as Refund;

    expect(refund.failure?.reason).toBe('unknown');
    expect(RefundFailureReasons.RefundDeclined).toBe('refund_declined');
  });
});
