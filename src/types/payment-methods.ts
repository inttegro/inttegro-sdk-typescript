import type { RequestMeta } from './requests';
import type { CustomData, CustomDataPatch } from './custom-data';

export const PaymentMethodTypes = {
  MobileMoney: 'mobile_money',
  BankAccount: 'bank_account',
  Card: 'card',
  Motito: 'motito',
} as const;
export type PaymentMethodType = (typeof PaymentMethodTypes)[keyof typeof PaymentMethodTypes];

export const MobileMoneyNetworks = {
  Airtel: 'airtel',
  MTN: 'mtn',
  Telecel: 'telecel',
  Vodafone: 'vodafone',
} as const;
export type MobileMoneyNetwork = (typeof MobileMoneyNetworks)[keyof typeof MobileMoneyNetworks];
export interface MobileMoneyDetails {
  accountNumber: string;
  network: MobileMoneyNetwork;
}

export interface PaymentMethodMobileMoney {
  accountNumber: string;
  last4: string;
  network: MobileMoneyNetwork;
}

export interface PaymentMethodBankAccount {
  type: string;
  ghanaBankAccount?: {
    branch?: string;
    name?: string;
    accountNumber: string;
    sortCode?: string;
    swiftCode?: string;
  } | null;
}

export type PaymentMethodCard = Readonly<Record<string, never>>;

export interface PaymentMethodVerification {
  completedAt?: Date | null;
  initiatedAt: Date;
  mechanism?: string;
  requestId: string;
  type: string;
}

export interface PaymentMethodData {
  type: 'mobile_money';
  mobileMoney: MobileMoneyDetails;
}

export interface PaymentMethodOwnerAddress {
  city?: string | null;
  country: string;
  line1?: string | null;
  line2?: string | null;
  name?: string | null;
  phoneNumber?: string | null;
  postCode?: string | null;
  region?: string | null;
}

export interface PaymentMethodOwner {
  name: string;
  address?: PaymentMethodOwnerAddress | null;
}

export interface PaymentMethodOwnerAddressPatch {
  city?: string | null;
  country?: string | null;
  line1?: string | null;
  line2?: string | null;
  name?: string | null;
  phoneNumber?: string | null;
  postCode?: string | null;
  region?: string | null;
}

export interface PaymentMethodOwnerPatch {
  name?: string | null;
  address?: PaymentMethodOwnerAddressPatch | null;
}

export interface PaymentMethod {
  id: string;
  active: boolean;
  archivedAt?: Date | null;
  customerId: string;
  type: PaymentMethodType;
  mobileMoney?: PaymentMethodMobileMoney | null;
  bankAccount?: PaymentMethodBankAccount | null;
  card?: PaymentMethodCard | null;
  owner?: PaymentMethodOwner | null;
  supplied?: PaymentMethodSupplied | null;
  verification?: PaymentMethodVerification | null;
  customData?: CustomData | null;
  ephemeral?: boolean;
  expiresOn?: Date | null;
  fingerprint: string;
  createdAt: Date;
  verifiedAt?: Date | null;
}

/** Deterministic questions about a payment-method response. */
export const PaymentMethod = {
  /** Whether the payment method is archived. */
  isArchived(method: PaymentMethod): boolean {
    return method.archivedAt != null;
  },

  /** Whether payment-method ownership has been verified. */
  isVerified(method: PaymentMethod): boolean {
    return method.verifiedAt != null;
  },

  /** Whether the payment method may be reused in new payment flows. */
  isReusable(method: PaymentMethod): boolean {
    return method.active && method.archivedAt == null && method.ephemeral !== true;
  },
} as const;

export interface PaymentMethodSupplied {
  by: string;
  channel?: string | null;
  resourceType?: string | null;
  resourceId?: string | null;
  attemptId?: string | null;
  suppliedAt: Date;
}

export interface TokenizePaymentMethodRequest {
  /** Request metadata such as idempotency controls */
  requestMeta?: RequestMeta;
  customerId: string;
  type: 'mobile_money';
  mobileMoney: MobileMoneyDetails;
  owner: PaymentMethodOwner;
  customData?: CustomData;
}

export interface VerifyPaymentMethodRequest {
  /** Request metadata such as idempotency controls */
  requestMeta?: RequestMeta;
  paymentMethodId: string;
}

export type VerificationStatus = 'pending' | 'verified' | 'failed' | string;

export interface PaymentMethodVerificationSession {
  paymentMethodId?: string;
  status?: VerificationStatus;
  tokenSentAt?: Date;
  expiresAt?: Date;
  delivery?: PaymentMethodVerificationDelivery;
}

export interface PaymentMethodVerificationDelivery {
  recipient?: string;
  channel?: 'sms' | 'email' | string;
  senderId?: string;
}

export interface ConfirmPaymentMethodVerificationRequest {
  paymentMethodId: string;
  token: string;
}

export interface LookupPaymentMethodRequest {
  paymentMethodId: string;
}

export interface PagePaymentMethodsRequest {
  customerId?: string;
  pageNumber?: number;
  pageSize?: number;
}

export interface PaymentMethodPage {
  number: number;
  size: number;
  paymentMethods: PaymentMethod[];
}

export interface UpdatePaymentMethodRequest {
  paymentMethodId: string;
  customData?: CustomDataPatch;
  active?: boolean;
  archived?: boolean;
  owner?: PaymentMethodOwnerPatch;
}

export interface PaymentMethodActionRequest {
  paymentMethodId: string;
}

export interface DeletePaymentMethodRequest {
  /** Request metadata such as idempotency controls */
  requestMeta?: RequestMeta;
  paymentMethodId: string;
}

export interface PaymentMethodDeletion {
  deleted?: boolean;
  paymentMethodId?: string;
}

export interface PaymentMethodTypeSetting {
  type?: PaymentMethodType;
  name?: string;
  description?: string;
  enabled: boolean;
  confirmsUse: boolean;
}

export interface PaymentMethodSettings {
  mobileMoney?: PaymentMethodTypeSetting;
  bankAccount?: PaymentMethodTypeSetting;
  card?: PaymentMethodTypeSetting;
  motito?: PaymentMethodTypeSetting;
}
