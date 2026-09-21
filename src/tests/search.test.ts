import { describe, expect, it, vi } from 'vitest';

import { HttpClient } from '../http-client';
import { Customers } from '../resources/customers';
import { FinancialAccounts } from '../resources/financial-accounts';
import { Orders } from '../resources/orders';
import { Payouts } from '../resources/payouts';
import { Products } from '../resources/products';
import { ResourceSearchPage, ResourceSearchRequest } from '..';

const request: ResourceSearchRequest = {
  text: 'Ama Mensah',
  filters: [{ field: 'status', operator: 'eq', values: ['paid'] }],
};

const page: ResourceSearchPage = {
  resourceTypes: ['order'],
  sort: { field: 'relevance', direction: 'desc' },
  pageSize: 20,
  resultCount: 0,
  hasMore: false,
  total: { value: 0, relation: 'exact' },
  resourceTotals: [{ resourceType: 'order', value: 0, relation: 'exact' }],
  results: [],
  facets: [],
  freshness: { state: 'current' },
};

describe('resource search', () => {
  it.each([
    [Customers, '/customers/search'],
    [FinancialAccounts, '/financial_accounts/search'],
    [Orders, '/orders/search'],
    [Payouts, '/payouts/search'],
    [Products, '/products/search'],
  ] as const)('uses the typed search contract for %s', async (Resource, path) => {
    const httpClient = new HttpClient({ apiKey: 'sk_test_example' });
    const postResource = vi.spyOn(httpClient, 'postResource').mockResolvedValue(page);
    const resource = new Resource(httpClient);

    await resource.search(request);

    expect(postResource).toHaveBeenCalledWith(path, 'search', request);
  });
});
