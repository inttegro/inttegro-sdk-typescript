import { afterEach, describe, expect, it, vi } from 'vitest';

import { HttpClient } from '../http-client';
import { InttegroValidationError } from '../errors';
import type { RequestMeta } from '../types/requests';

describe('TypeScript API casing', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('serializes camelCase request fields to snake_case without changing custom data keys', async () => {
    const calls: RequestInit[] = [];
    vi.stubGlobal(
      'fetch',
      vi.fn(async (_url: string, options: RequestInit) => {
        calls.push(options);
        return jsonResponse({ order: { id: 'or_123' } });
      })
    );

    const client = new HttpClient({ apiKey: 'sk_test' });
    await client.post('/orders/create', {
      customerData: { emailAddress: 'person@example.com' },
      lineItems: [],
      customData: { external_id: 'kept', camelKey: 'also-kept' },
    });

    const body = JSON.parse(calls[0].body as string);
    expect(body).toMatchObject({
      customer_data: { email_address: 'person@example.com' },
      line_items: [],
      custom_data: { external_id: 'kept', camelKey: 'also-kept' },
    });
    expect(body.customerData).toBeUndefined();
    expect(body.request_meta.idempotency_key).toBeTypeOf('string');
  });

  it('serializes typed response projections without changing resource property paths', async () => {
    const calls: RequestInit[] = [];
    vi.stubGlobal(
      'fetch',
      vi.fn(async (_url: string, options: RequestInit) => {
        calls.push(options);
        return jsonResponse({ order: { id: 'or_123', status: 'draft' } });
      })
    );

    const requestMeta: RequestMeta = {
      response: {
        projection: {
          order: { pick: ['id', 'status', 'customer.name'] },
          payment: { omit: ['latest_error'] },
        },
      },
    };
    const client = new HttpClient({ apiKey: 'sk_test' });
    await client.post('/orders/create', { requestMeta });

    expect(JSON.parse(calls[0].body as string)).toMatchObject({
      request_meta: {
        response: {
          projection: {
            order: { pick: ['id', 'status', 'customer.name'] },
            payment: { omit: ['latest_error'] },
          },
        },
      },
    });
  });

  it('deserializes snake_case response fields to camelCase without changing custom data keys', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        jsonResponse({
          order: {
            id: 'or_123',
            created_at: '2026-09-10T08:15:30.123Z',
            payment_status: 'paid',
            line_items: [{ product_id: 'prod_123' }],
            custom_data: {
              external_id: 'kept',
              camelKey: 'also-kept',
              created_at: 'opaque',
            },
          },
        })
      )
    );

    const client = new HttpClient({ apiKey: 'sk_test' });
    const response = await client.post<{
      order: {
        createdAt: Date;
        paymentStatus: string;
        lineItems: Array<{ productId: string }>;
        customData: Record<string, string>;
      };
    }>('/orders/lookup', { orderId: 'or_123' });

    expect(response.order.paymentStatus).toBe('paid');
    expect(response.order.createdAt).toEqual(new Date('2026-09-10T08:15:30.123Z'));
    expect(response.order.lineItems[0].productId).toBe('prod_123');
    expect(response.order.customData).toEqual({
      external_id: 'kept',
      camelKey: 'also-kept',
      created_at: 'opaque',
    });
    expect((response.order as Record<string, unknown>).payment_status).toBeUndefined();
  });

  it('serializes Date request fields as ISO-8601 timestamps', async () => {
    const calls: RequestInit[] = [];
    vi.stubGlobal(
      'fetch',
      vi.fn(async (_url: string, options: RequestInit) => {
        calls.push(options);
        return jsonResponse({ purchase_intent: { id: 'sale_123' } });
      })
    );

    const client = new HttpClient({ apiKey: 'sk_test' });
    const expiresAt = new Date('2026-10-01T12:00:00.000Z');
    await client.post('/purchase_intents/update', { id: 'sale_123', expiresAt });

    expect(JSON.parse(calls[0].body as string)).toMatchObject({
      id: 'sale_123',
      expires_at: '2026-10-01T12:00:00.000Z',
    });
  });

  it('rejects response timestamps without a UTC offset', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => jsonResponse({ order: { created_at: '2026-09-10T08:15:30' } }))
    );

    const client = new HttpClient({ apiKey: 'sk_test' });
    await expect(client.post('/orders/lookup', { orderId: 'or_123' })).rejects.toThrow(
      'timestamp without a UTC offset'
    );
  });

  it('exposes error documents with camelCase fields', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        jsonResponse(
          {
            error: {
              type: 'invalid_request',
              message: 'Invalid request',
              fix_code: 'Use a valid value',
            },
          },
          400
        )
      )
    );

    const client = new HttpClient({ apiKey: 'sk_test' });

    await expect(client.get('/orders/lookup')).rejects.toMatchObject({
      fixCode: 'Use a valid value',
      errorDocument: {
        error: {
          type: 'invalid_request',
          message: 'Invalid request',
          fixCode: 'Use a valid value',
        },
      },
    } satisfies Partial<InttegroValidationError>);
  });
});

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}
