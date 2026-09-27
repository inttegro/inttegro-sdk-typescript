import type { CustomData, CustomDataInput } from './custom-data';
import type { Amount } from './money';
import type { RequestMeta } from './requests';

export interface CustomerAddressInput {
  country: string;
  city?: string;
  line1?: string;
  line2?: string;
  name?: string;
  phoneNumber?: string;
  postCode?: string;
  region?: string;
}

/**
 * Customer data for new customers
 */
export interface CustomerData {
  /** Customer full name */
  name: string;
  /** Customer email address */
  emailAddress: string;
  /** Customer phone number */
  phoneNumber: string;
  /** External reference for the customer */
  reference?: string;
  /** Custom data for the customer */
  customData?: CustomDataInput;
}

/**
 * Customer creation request for customer endpoints
 */
export interface CreateCustomerRequest {
  /** Request metadata such as idempotency controls */
  requestMeta?: RequestMeta;
  name: string;
  title?: string;
  suffix?: string;
  reference?: string;
  emailAddress?: string;
  phoneNumber?: string;
  customData?: CustomDataInput;
  billingAddress?: CustomerAddressInput;
  shippingAddress?: CustomerAddressInput;
}

export interface UpdateCustomerRequest {
  customerId: string;
  billingAddress?: CustomerAddressInput;
  customData?: CustomDataInput;
  emailAddress?: string;
  name?: string;
  phoneNumber?: string;
  reference?: string;
  shippingAddress?: CustomerAddressInput;
  suffix?: string;
  title?: string;
}

export interface LookupCustomerRequest {
  customerId: string;
}

export interface Customer {
  balance: CustomerBalance;
  billingAddress?: CustomerAddress | null;
  createdAt: Date;
  customData?: CustomData;
  emailAddress?: string | null;
  /** App-scoped value for spotting possible duplicate customer records. */
  fingerprint: string;
  guest: boolean;
  id: string;
  name: string;
  phoneNumber?: string | null;
  reference?: string | null;
  shippingAddress?: CustomerAddress | null;
  suffix?: string | null;
  title?: string | null;
  updatedAt?: Date | null;
}

export type CustomerAddress = CustomerAddressInput;

export interface CustomerBalanceValue {
  asOf: Date;
  available: Amount;
}

export type CustomerBalance = Readonly<Record<string, CustomerBalanceValue>>;

export interface PageCustomersRequest {
  pageNumber?: number;
  pageSize?: number;
}

export interface CustomerPage {
  number?: number;
  size?: number;
  customers?: Customer[];
}

/**
 * Address information
 */
export interface Address {
  /** Recipient name */
  name: string;
  /** Phone number */
  phoneNumber: string;
  /** Address line 1 */
  line1: string;
  /** Address line 2 (optional) */
  line2?: string;
  /** Town/City */
  town: string;
  /** Region/State */
  region: string;
  /** Country code (e.g., 'GH') */
  country: string;
  /** District (optional) */
  district?: string;
  /** Postal code (optional) */
  postCode?: string;
}
