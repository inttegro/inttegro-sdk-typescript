import { beforeEach, describe, expect, it, vi } from 'vitest';

import { BalanceTransactions } from '../resources/balance-transactions';
import { HttpClient } from '../http-client';
import type { BalanceTransaction } from '../types/balance-transactions';
import type { Payment } from '../types/orders';

describe('BalanceTransactions', () => {
  let balanceTransactions: BalanceTransactions;
  let httpClient: HttpClient;

  beforeEach(() => {
    httpClient = new HttpClient({ apiKey: 'test' });
    balanceTransactions = new BalanceTransactions(httpClient);
  });

  it('should lookup a balance transaction', async () => {
    const mockResponse = {
      transaction: {
        id: 'bt_123',
        type: 'payment',
        paymentId: 'py_123',
        orderId: 'or_123',
        amount: { currency: 'GHS', value: 2500 },
        allocations: [
          {
            id: 'bta_123',
            type: 'payout',
            status: 'pending',
            payout: {
              id: 'po_123',
              amount: { currency: 'GHS', value: 1000 },
            },
            createdAt: '2026-08-31T12:01:00Z',
            updatedAt: '2026-08-31T12:01:00Z',
          },
        ],
        availableAmount: { currency: 'GHS', value: 1500 },
        pendingAmount: { currency: 'GHS', value: 1000 },
        spentAmount: { currency: 'GHS', value: 0 },
        createdAt: '2026-08-31T12:00:00Z',
      },
    };
    const postSpy = vi.spyOn(httpClient, 'post').mockResolvedValue(mockResponse);

    const result = await balanceTransactions.lookup({ transactionId: 'bt_123' });

    expect(result).toEqual(mockResponse.transaction);
    expect(postSpy).toHaveBeenCalledWith('/balance_transactions/lookup', {
      transactionId: 'bt_123',
    });

    const transaction = result;
    if (transaction.type === 'payment') {
      expect(transaction.paymentId).toBe('py_123');
      expect(transaction.refundId).toBeUndefined();
      expect(transaction.allocations?.[0]?.type).toBe('payout');
      expect(transaction.availableAmount?.value).toBe(1500);
    }
  });

  it('models refund transactions with only their matching strong reference', () => {
    const transaction: BalanceTransaction = {
      id: 'bt_refund',
      type: 'refund',
      refundId: 'rf_123',
      orderId: 'or_123',
      amount: { currency: 'GHS', value: 500 },
      createdAt: '2026-08-31T12:00:00Z',
    };

    if (transaction.type === 'refund') {
      expect(transaction.refundId).toBe('rf_123');
      expect(transaction.paymentId).toBeUndefined();
    }
  });

  it('reuses the canonical model for order-embedded balance transactions', () => {
    const payment: Payment = {
      balanceTransaction: {
        id: 'bt_payment',
        type: 'payment',
        paymentId: 'py_123',
        orderId: 'or_123',
        amount: { currency: 'GHS', value: 2500 },
        createdAt: '2026-08-31T12:00:00Z',
      },
    };

    expect(payment.balanceTransaction?.type).toBe('payment');
  });

  it('should page balance transactions', async () => {
    const mockResponse = { page: { number: 1, size: 20, transactions: [] } };
    const postSpy = vi.spyOn(httpClient, 'post').mockResolvedValue(mockResponse);

    const result = await balanceTransactions.page({ pageNumber: 1, pageSize: 20 });

    expect(result).toEqual(mockResponse.page);
    expect(postSpy).toHaveBeenCalledWith('/balance_transactions/page', {
      pageNumber: 1,
      pageSize: 20,
    });
  });

  it('should validate transaction_id for lookup', async () => {
    await expect(balanceTransactions.lookup({} as any)).rejects.toThrow('Validation failed');
  });
});
