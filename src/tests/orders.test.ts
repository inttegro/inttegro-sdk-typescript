/**
 * Tests for Orders resource
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Orders } from '../resources/orders';
import { HttpClient } from '../http-client';
import {
  mockCreateOrderResponse,
  mockLookupOrderResponse,
  mockPayOrderResponse,
  mockConfirmPaymentResponse,
  mockRequestConfirmationResponse,
} from './mocks';

describe('Orders', () => {
  let orders: Orders;
  let httpClient: HttpClient;

  beforeEach(() => {
    httpClient = new HttpClient({
      apiKey: 'test_key',
    });
    orders = new Orders(httpClient);
  });

  describe('create', () => {
    it('should create an order with customer data', async () => {
      const postSpy = vi.spyOn(httpClient, 'post').mockResolvedValue(mockCreateOrderResponse);

      const result = await orders.create({
        customerData: {
          name: 'John Doe',
          emailAddress: 'john@example.com',
          phoneNumber: '0559714200',
        },
        lineItems: [
          {
            type: 'product',
            product: {
              type: 'physical',
              quantity: 1,
              name: 'Test Product',
              price: { currency: 'ghs', value: 20000 },
            },
          },
        ],
        billingDetails: {
          emailAddress: 'john@example.com',
          phoneNumber: '0559714200',
          name: 'John Doe',
          address: {
            name: 'John Doe',
            phoneNumber: '0559714200',
            line1: '123 Main St',
            town: 'Accra',
            region: 'Greater Accra',
            country: 'GH',
          },
        },
      });

      expect(result).toEqual(mockCreateOrderResponse.order);
      expect(postSpy).toHaveBeenCalledWith('/orders/create', expect.any(Object));
    });

    it('should create an order with catalog product and price references', async () => {
      const postSpy = vi.spyOn(httpClient, 'post').mockResolvedValue(mockCreateOrderResponse);

      await orders.create({
        customerData: {
          name: 'John Doe',
          emailAddress: 'john@example.com',
          phoneNumber: '0559714200',
        },
        lineItems: [
          {
            type: 'product',
            product: {
              productId: 'prod_123',
              priceId: 'pr_123',
              quantity: 2,
            },
          },
          {
            type: 'product',
            product: {
              productId: 'prod_456',
              price: { currency: 'ghs', value: 1500 },
              quantity: 1,
            },
          },
        ],
      });

      expect(postSpy).toHaveBeenCalledWith(
        '/orders/create',
        expect.objectContaining({
          lineItems: [
            {
              type: 'product',
              product: {
                productId: 'prod_123',
                priceId: 'pr_123',
                quantity: 2,
              },
            },
            {
              type: 'product',
              product: {
                productId: 'prod_456',
                price: { currency: 'ghs', value: 1500 },
                quantity: 1,
              },
            },
          ],
        })
      );
    });

    it('should create an order with response metadata', async () => {
      const headers = new Headers({
        'x-request-id': 'req_123',
        'retry-after': '30',
      });
      const postSpy = vi.spyOn(httpClient, 'postResourceWithResponse').mockResolvedValue({
        data: mockCreateOrderResponse.order,
        status: 200,
        headers,
        requestId: 'req_123',
        retryAfter: '30',
        meta: { requestId: 'req_123', debug: { providerAttempts: 1 } },
      });

      const result = await orders.createWithResponse({
        customerData: {
          name: 'John Doe',
          emailAddress: 'john@example.com',
          phoneNumber: '0559714200',
        },
        lineItems: [
          {
            type: 'product',
            product: {
              type: 'physical',
              quantity: 1,
              name: 'Test Product',
              price: { currency: 'ghs', value: 20000 },
            },
          },
        ],
        billingDetails: {
          emailAddress: 'john@example.com',
          phoneNumber: '0559714200',
          name: 'John Doe',
          address: {
            name: 'John Doe',
            phoneNumber: '0559714200',
            line1: '123 Main St',
            town: 'Accra',
            region: 'Greater Accra',
            country: 'GH',
          },
        },
      });

      expect(result.data).toEqual(mockCreateOrderResponse.order);
      expect(result.status).toBe(200);
      expect(result.requestId).toBe('req_123');
      expect(result.retryAfter).toBe('30');
      expect(result.headers.get('x-request-id')).toBe('req_123');
      expect(result.meta).toEqual({ requestId: 'req_123', debug: { providerAttempts: 1 } });
      expect(postSpy).toHaveBeenCalledWith('/orders/create', 'order', expect.any(Object));
    });

    it('should create an order with customer ID', async () => {
      const postSpy = vi.spyOn(httpClient, 'post').mockResolvedValue(mockCreateOrderResponse);

      const result = await orders.create({
        customerId: 'cu_123',
        lineItems: [
          {
            type: 'product',
            product: {
              type: 'physical',
              quantity: 1,
              name: 'Test Product',
              price: { currency: 'ghs', value: 20000 },
            },
          },
        ],
        billingDetails: {
          emailAddress: 'john@example.com',
          phoneNumber: '0559714200',
          name: 'John Doe',
          address: {
            name: 'John Doe',
            phoneNumber: '0559714200',
            line1: '123 Main St',
            town: 'Accra',
            region: 'Greater Accra',
            country: 'GH',
          },
        },
      });

      expect(result).toEqual(mockCreateOrderResponse.order);
      expect(postSpy).toHaveBeenCalledWith('/orders/create', expect.any(Object));
    });

    it('should throw validation error when required fields are missing', async () => {
      await expect(
        orders.create({
          customerData: {
            name: 'John Doe',
            emailAddress: 'john@example.com',
            phoneNumber: '0559714200',
          },
        } as any)
      ).rejects.toThrow('Validation failed');
    });

    it('should throw validation error when neither customer_data nor customer_id provided', async () => {
      await expect(
        orders.create({
          lineItems: [
            {
              type: 'product',
              product: {
                type: 'physical',
                quantity: 1,
                name: 'Test Product',
                price: { currency: 'ghs', value: 20000 },
              },
            },
          ],
          billingDetails: {
            emailAddress: 'john@example.com',
            phoneNumber: '0559714200',
            name: 'John Doe',
            address: {
              name: 'John Doe',
              phoneNumber: '0559714200',
              line1: '123 Main St',
              town: 'Accra',
              region: 'Greater Accra',
              country: 'GH',
            },
          },
        } as any)
      ).rejects.toThrow('Validation failed');
    });
  });

  describe('lookup', () => {
    it('should lookup an order by ID', async () => {
      const postSpy = vi.spyOn(httpClient, 'post').mockResolvedValue(mockLookupOrderResponse);

      const result = await orders.lookup({
        orderId: 'or_123',
      });

      expect(result).toEqual(mockLookupOrderResponse.order);
      expect(postSpy).toHaveBeenCalledWith('/orders/lookup', { orderId: 'or_123' });
    });

    it('should throw validation error when order_id is missing', async () => {
      await expect(orders.lookup({} as any)).rejects.toThrow('Validation failed');
    });
  });

  describe('update', () => {
    it('should update an order', async () => {
      const postSpy = vi.spyOn(httpClient, 'post').mockResolvedValue(mockLookupOrderResponse);

      const result = await orders.update({
        orderId: 'or_123',
        number: 'ORDER-123-REV2',
      });

      expect(result).toEqual(mockLookupOrderResponse.order);
      expect(postSpy).toHaveBeenCalledWith('/orders/update', {
        orderId: 'or_123',
        number: 'ORDER-123-REV2',
      });
    });

    it('should throw validation error when order_id is missing on update', async () => {
      await expect(orders.update({} as any)).rejects.toThrow('Validation failed');
    });
  });

  describe('pay', () => {
    it('should pay for an order with payment method data', async () => {
      const postSpy = vi.spyOn(httpClient, 'post').mockResolvedValue(mockPayOrderResponse);

      const result = await orders.pay({
        orderId: 'or_123',
        paymentMethodData: {
          type: 'mobile_money',
          mobileMoney: {
            network: 'mtn',
            accountNumber: '0544998605',
          },
        },
      });

      expect(result).toEqual(mockPayOrderResponse.order);
      expect(postSpy).toHaveBeenCalledWith('/orders/pay', expect.any(Object));
    });

    it('should pay for an order with saved payment method', async () => {
      const postSpy = vi.spyOn(httpClient, 'post').mockResolvedValue(mockPayOrderResponse);

      const result = await orders.pay({
        orderId: 'or_123',
      });

      expect(result).toEqual(mockPayOrderResponse.order);
      expect(postSpy).toHaveBeenCalledWith('/orders/pay', { orderId: 'or_123' });
    });

    it('should throw validation error when order_id is missing', async () => {
      await expect(orders.pay({} as any)).rejects.toThrow('Validation failed');
    });
  });

  describe('confirmPayment', () => {
    it('should confirm payment with token', async () => {
      const postSpy = vi.spyOn(httpClient, 'post').mockResolvedValue(mockConfirmPaymentResponse);

      const result = await orders.confirmPayment({
        orderId: 'or_123',
        paymentId: 'py_123',
        confirmationId: 'pc_123',
        token: '123456',
      });

      expect(result).toEqual(mockConfirmPaymentResponse.order);
      expect(postSpy).toHaveBeenCalledWith('/orders/confirm_payment', {
        orderId: 'or_123',
        paymentId: 'py_123',
        confirmationId: 'pc_123',
        token: '123456',
      });
    });

    it('should throw validation error when required fields are missing', async () => {
      await expect(orders.confirmPayment({ orderId: 'or_123' } as any)).rejects.toThrow(
        'Validation failed'
      );
    });
  });

  describe('requestConfirmation', () => {
    it('should request confirmation', async () => {
      const postSpy = vi
        .spyOn(httpClient, 'post')
        .mockResolvedValue(mockRequestConfirmationResponse);

      const result = await orders.requestConfirmation({
        orderId: 'or_123',
      });

      expect(result).toEqual(mockRequestConfirmationResponse.order);
      expect(postSpy).toHaveBeenCalledWith('/orders/request_confirmation', {
        orderId: 'or_123',
      });
    });

    it('should throw validation error when order_id is missing', async () => {
      await expect(orders.requestConfirmation({} as any)).rejects.toThrow('Validation failed');
    });
  });

  describe('finalize', () => {
    it('should finalize an order', async () => {
      const postSpy = vi.spyOn(httpClient, 'post').mockResolvedValue(mockLookupOrderResponse);

      const result = await orders.finalize({ orderId: 'or_123' });
      expect(result).toEqual(mockLookupOrderResponse.order);
      expect(postSpy).toHaveBeenCalledWith('/orders/finalize', { orderId: 'or_123' });
    });
  });

  describe('sendInvoice', () => {
    it('should send an invoice link', async () => {
      const response = {
        order: mockLookupOrderResponse.order,
        delivery: {
          documentKind: 'invoice',
          documentUrl: 'https://pages.inttegro.com/invoices/or_123',
          sentChannels: ['sms'],
        },
      };
      const postSpy = vi.spyOn(httpClient, 'post').mockResolvedValue(response);

      const result = await orders.sendInvoice({ orderId: 'or_123' });
      expect(result).toEqual(response);
      expect(postSpy).toHaveBeenCalledWith('/orders/send_invoice', { orderId: 'or_123' });
    });

    it('should throw validation error when order_id is missing', async () => {
      await expect(orders.sendInvoice({} as any)).rejects.toThrow('Validation failed');
    });
  });

  describe('sendReceipt', () => {
    it('should send a receipt link', async () => {
      const response = {
        order: mockLookupOrderResponse.order,
        delivery: {
          documentKind: 'receipt',
          documentUrl: 'https://pages.inttegro.com/invoices/or_123/receipt',
          sentChannels: ['email'],
        },
      };
      const postSpy = vi.spyOn(httpClient, 'post').mockResolvedValue(response);

      const result = await orders.sendReceipt({ orderId: 'or_123' });
      expect(result).toEqual(response);
      expect(postSpy).toHaveBeenCalledWith('/orders/send_receipt', { orderId: 'or_123' });
    });

    it('should throw validation error when order_id is missing', async () => {
      await expect(orders.sendReceipt({} as any)).rejects.toThrow('Validation failed');
    });
  });

  describe('complete', () => {
    it('should complete an order', async () => {
      const postSpy = vi.spyOn(httpClient, 'post').mockResolvedValue(mockLookupOrderResponse);

      const result = await orders.complete({ orderId: 'or_123', paidOutOfBand: true });
      expect(result).toEqual(mockLookupOrderResponse.order);
      expect(postSpy).toHaveBeenCalledWith('/orders/complete', {
        orderId: 'or_123',
        paidOutOfBand: true,
      });
    });
  });

  describe('cancel', () => {
    it('should cancel an order', async () => {
      const postSpy = vi.spyOn(httpClient, 'post').mockResolvedValue(mockLookupOrderResponse);

      const result = await orders.cancel({ orderId: 'or_123' });
      expect(result).toEqual(mockLookupOrderResponse.order);
      expect(postSpy).toHaveBeenCalledWith('/orders/cancel', { orderId: 'or_123' });
    });
  });
});
