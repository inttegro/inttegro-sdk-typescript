import { beforeEach, describe, expect, it, vi } from 'vitest';

import { HttpClient } from '../http-client';
import { PaymentMethods } from '../resources/payment-methods';

describe('PaymentMethods', () => {
  let paymentMethods: PaymentMethods;
  let httpClient: HttpClient;

  beforeEach(() => {
    httpClient = new HttpClient({ apiKey: 'test' });
    paymentMethods = new PaymentMethods(httpClient);
  });

  it('should page and update payment methods', async () => {
    const mockResponse = {
      paymentMethod: { id: 'pm_123', customerId: 'cu_123', fingerprint: 'ifp_v1_app_customer' },
      page: { number: 1, size: 20, paymentMethods: [] },
    };
    const postSpy = vi.spyOn(httpClient, 'post').mockResolvedValue(mockResponse);

    await paymentMethods.page({ customerId: 'cu_123', pageNumber: 1, pageSize: 20 });
    const result = await paymentMethods.update({
      paymentMethodId: 'pm_123',
      customData: { segment: 'vip', internalNote: null },
    });

    expect(result).toEqual(mockResponse.paymentMethod);
    expect(result.fingerprint).toBe('ifp_v1_app_customer');
    expect(postSpy).toHaveBeenCalledWith('/payment_methods/page', {
      customerId: 'cu_123',
      pageNumber: 1,
      pageSize: 20,
    });
    expect(postSpy).toHaveBeenCalledWith('/payment_methods/update', {
      paymentMethodId: 'pm_123',
      customData: { segment: 'vip', internalNote: null },
    });
  });

  it('should activate, disactivate, archive, and unarchive payment methods', async () => {
    const mockResponse = { paymentMethod: { id: 'pm_123', customerId: 'cu_123', fingerprint: '' } };
    const postSpy = vi.spyOn(httpClient, 'post').mockResolvedValue(mockResponse);

    await paymentMethods.activate({ paymentMethodId: 'pm_123' });
    await paymentMethods.disactivate({ paymentMethodId: 'pm_123' });
    await paymentMethods.archive({ paymentMethodId: 'pm_123' });
    const result = await paymentMethods.unarchive({ paymentMethodId: 'pm_123' });

    expect(result).toEqual(mockResponse.paymentMethod);
    expect(result.fingerprint).toBe('');
    expect(postSpy).toHaveBeenCalledWith('/payment_methods/activate', {
      paymentMethodId: 'pm_123',
    });
    expect(postSpy).toHaveBeenCalledWith('/payment_methods/disactivate', {
      paymentMethodId: 'pm_123',
    });
    expect(postSpy).toHaveBeenCalledWith('/payment_methods/archive', {
      paymentMethodId: 'pm_123',
    });
    expect(postSpy).toHaveBeenCalledWith('/payment_methods/unarchive', {
      paymentMethodId: 'pm_123',
    });
  });

  it('should validate payment_method_id for update', async () => {
    await expect(paymentMethods.update({} as any)).rejects.toThrow('Validation failed');
  });
});
