import type { Amount } from './money';

export const ResourceSearchOperators = {
  Eq: 'eq',
  In: 'in',
} as const;

export type ResourceSearchOperator =
  (typeof ResourceSearchOperators)[keyof typeof ResourceSearchOperators];

export const ResourceSearchSortFields = {
  Relevance: 'relevance',
  UpdatedAt: 'updated_at',
  PublishedAt: 'published_at',
} as const;

export type ResourceSearchSortField =
  (typeof ResourceSearchSortFields)[keyof typeof ResourceSearchSortFields];

export const ResourceSearchSortDirections = {
  Ascending: 'asc',
  Descending: 'desc',
} as const;

export type ResourceSearchSortDirection =
  (typeof ResourceSearchSortDirections)[keyof typeof ResourceSearchSortDirections];

export const ResourceSearchResourceTypes = {
  Customer: 'customer',
  FinancialAccount: 'financial_account',
  Order: 'order',
  Payout: 'payout',
  Product: 'product',
} as const;

export type ResourceSearchResourceType =
  (typeof ResourceSearchResourceTypes)[keyof typeof ResourceSearchResourceTypes];

export const ResourceSearchTotalRelations = {
  Exact: 'exact',
  LowerBound: 'lower_bound',
} as const;

export type ResourceSearchTotalRelation =
  (typeof ResourceSearchTotalRelations)[keyof typeof ResourceSearchTotalRelations];

export const ResourceSearchFreshnessStates = {
  Current: 'current',
  Delayed: 'delayed',
  Partial: 'partial',
  Unknown: 'unknown',
  Unavailable: 'unavailable',
} as const;

export type ResourceSearchFreshnessState =
  (typeof ResourceSearchFreshnessStates)[keyof typeof ResourceSearchFreshnessStates];

export interface ResourceSearchFilter {
  field: string;
  operator: ResourceSearchOperator;
  values: string[];
}

export interface ResourceSearchFacet {
  field: string;
  limit?: number;
}

export interface ResourceSearchSort {
  field: ResourceSearchSortField;
  direction: ResourceSearchSortDirection;
}

export interface ResourceSearchRequest {
  text?: string;
  filters?: ResourceSearchFilter[];
  facets?: ResourceSearchFacet[];
  sort?: ResourceSearchSort;
  pageSize?: number;
  cursor?: string;
}

export interface ResourceSearchTotal {
  value: number;
  relation: ResourceSearchTotalRelation;
}

export interface ResourceSearchResourceTotal extends ResourceSearchTotal {
  resourceType: ResourceSearchResourceType;
}

export interface ResourceSearchResourceReference {
  type: ResourceSearchResourceType;
  id: string;
}

export type ResourceSearchAmount = Amount;

export interface ResourceSearchResult {
  resource: ResourceSearchResourceReference;
  title: string;
  summary?: string;
  status?: string;
  customerName?: string;
  amount?: ResourceSearchAmount;
  url?: string;
  updatedAt: Date;
}

export interface ResourceSearchFacetBucket {
  value: string;
  count: number;
}

export interface ResourceSearchFacetResult {
  field: string;
  buckets: ResourceSearchFacetBucket[];
}

export interface ResourceSearchResourceFreshness {
  resourceType: ResourceSearchResourceType;
  state: ResourceSearchFreshnessState;
  observedAt?: Date;
  lastIndexedAt?: Date;
}

export interface ResourceSearchFreshness {
  state: ResourceSearchFreshnessState;
  observedAt?: Date;
  resources?: ResourceSearchResourceFreshness[];
}

export interface ResourceSearchPage {
  resourceTypes: ResourceSearchResourceType[];
  sort: ResourceSearchSort;
  pageSize: number;
  resultCount: number;
  hasMore: boolean;
  total: ResourceSearchTotal;
  resourceTotals: ResourceSearchResourceTotal[];
  results: ResourceSearchResult[];
  facets: ResourceSearchFacetResult[];
  nextCursor?: string;
  freshness: ResourceSearchFreshness;
}
