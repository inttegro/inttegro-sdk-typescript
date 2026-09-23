import { describe, it, expect, expectTypeOf, vi, beforeEach } from 'vitest';
import { Payouts } from '../resources/payouts';
import { HttpClient } from '../http-client';
import type {
  Payout,
  PayoutBalanceTransaction,
  PayoutDestinations,
  PayoutError,
  PayoutSettingsMutation,
} from '../types/payouts';

describe('Payouts', () => {
  let payouts: Payouts;
  let httpClient: HttpClient;

  beforeEach(() => {
    httpClient = new HttpClient({ apiKey: 'test' });
    payouts = new Payouts(httpClient);
  });

  it('should page payouts', async () => {
    const postSpy = vi.spyOn(httpClient, 'post').mockResolvedValue({ page: { payouts: [] } });

    const result = await payouts.page({ pageNumber: 1, pageSize: 20 });

    expect(result).toEqual({ payouts: [] });
    expect(postSpy).toHaveBeenCalledWith('/payouts/page', { pageNumber: 1, pageSize: 20 });
  });

  it('should schedule and lookup payouts', async () => {
    const mockResponse = { payout: { id: 'po_123', status: 'scheduled' } };
    const postSpy = vi.spyOn(httpClient, 'post').mockResolvedValue(mockResponse);

    await payouts.schedule({
      destinationId: 'fa_123',
      maxAmount: 250000,
      reference: 'PAYOUT-APR-15',
    });
    const result = await payouts.lookup({ payoutId: 'po_123' });

    expect(result).toEqual(mockResponse.payout);
    expect(postSpy).toHaveBeenCalledWith('/payouts/schedule', {
      destinationId: 'fa_123',
      maxAmount: 250000,
      reference: 'PAYOUT-APR-15',
    });
    expect(postSpy).toHaveBeenCalledWith('/payouts/lookup', { payoutId: 'po_123' });
  });

  it('should enable automatic payouts', async () => {
    const mockResponse = { settings: { id: 'payout_settings', automatic: true } };
    const postSpy = vi.spyOn(httpClient, 'post').mockResolvedValue(mockResponse);

    const result = await payouts.enableAutomatic();

    expect(result).toEqual(mockResponse.settings);
    expect(postSpy).toHaveBeenCalledWith('/payouts/enable', {});
  });

  it('should cancel scheduled payout', async () => {
    const mockResponse = { payout: { id: 'po_123', status: 'canceled' } };
    const postSpy = vi.spyOn(httpClient, 'post').mockResolvedValue(mockResponse);

    const result = await payouts.cancel({ payoutId: 'po_123' });

    expect(result).toEqual(mockResponse.payout);
    expect(postSpy).toHaveBeenCalledWith('/payouts/cancel', { payoutId: 'po_123' });
  });

  it('should validate payout_id for cancel', async () => {
    await expect(payouts.cancel({ payoutId: '' })).rejects.toThrow('Validation failed');
  });

  it('exposes canonical payout fields with concrete types', () => {
    expectTypeOf<Payout['executeAfter']>().toEqualTypeOf<Date>();
    expectTypeOf<Payout['error']>().toEqualTypeOf<PayoutError | undefined>();
    expectTypeOf<Payout['balanceTransactions']>().toEqualTypeOf<
      PayoutBalanceTransaction[] | undefined
    >();
    expectTypeOf<PayoutSettingsMutation['destinations']>().toEqualTypeOf<
      PayoutDestinations | undefined
    >();
  });
});
