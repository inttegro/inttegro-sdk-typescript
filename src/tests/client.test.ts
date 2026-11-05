/**
 * Tests for InttegroClient
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { InttegroClient } from '../client';
import { createMockFetch } from './mocks';

describe('InttegroClient', () => {
  describe('constructor', () => {
    it('should create a client with valid config', () => {
      const client = new InttegroClient({
        apiKey: 'test_key',
      });

      expect(client).toBeDefined();
      expect(client.orders).toBeDefined();
      expect(client.apps).toBeDefined();
      expect(client.childrenPolicies).toBeDefined();
      expect(client.operatingPolicies).toBeDefined();
      expect(client.keys).toBeDefined();
      expect(client.purchaseIntents).toBeDefined();
      expect(client.fileReferences).toBeDefined();
    });

    it('should throw error when API key is missing', () => {
      expect(() => {
        new InttegroClient({
          apiKey: '',
        });
      }).toThrow('API key is required');
    });

    it('should accept custom configuration', () => {
      const client = new InttegroClient({
        apiKey: 'test_key',
        baseUrl: 'https://custom.api.com',
        timeout: 60000,
        debug: true,
      });

      expect(client).toBeDefined();
    });
  });

  describe('updateConfig', () => {
    let client: InttegroClient;

    beforeEach(() => {
      client = new InttegroClient({
        apiKey: 'test_key',
      });
    });

    it('should update config', () => {
      expect(() => {
        client.updateConfig({
          timeout: 45000,
          debug: true,
        });
      }).not.toThrow();
    });
  });

  describe('interceptors', () => {
    let client: InttegroClient;

    beforeEach(() => {
      client = new InttegroClient({
        apiKey: 'test_key',
      });
    });

    it('should add request interceptor', () => {
      expect(() => {
        client.addRequestInterceptor((url, options) => {
          return { url, options };
        });
      }).not.toThrow();
    });

    it('should add response interceptor', () => {
      expect(() => {
        client.addResponseInterceptor((response) => {
          return response;
        });
      }).not.toThrow();
    });
  });

  describe('response envelopes', () => {
    it('should expose response-only HTTP facts and response_meta', async () => {
      const originalFetch = global.fetch;
      global.fetch = vi.fn(
        createMockFetch(
          {
            order: { id: 'or_123' },
            response_meta: {
              request_id: 'req_123',
              debug: { provider_attempts: 1 },
            },
          },
          200,
          {
            'x-request-id': 'req_123',
            'retry-after': '15',
          }
        )
      ) as unknown as typeof fetch;

      try {
        const client = new InttegroClient({ apiKey: 'test_key' });
        const response = await client.postWithResponse<Record<string, unknown>>(
          '/orders/create',
          {}
        );

        expect(response.status).toBe(200);
        expect(response.requestId).toBe('req_123');
        expect(response.retryAfter).toBe('15');
        expect(response.headers.get('x-request-id')).toBe('req_123');
        expect(response.meta).toEqual({
          requestId: 'req_123',
          debug: { providerAttempts: 1 },
        });
        expect(response.data).toEqual({
          order: { id: 'or_123' },
          responseMeta: {
            requestId: 'req_123',
            debug: { providerAttempts: 1 },
          },
        });
      } finally {
        global.fetch = originalFetch;
      }
    });
  });
});
