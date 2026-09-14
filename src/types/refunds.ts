import type { Amount, AmountParams } from './money';
import type { CustomData } from './custom-data';
import type { RequestMeta } from './requests';

export const RefundReasons = {
  RequestedByCustomer: 'requested_by_customer',
  Duplicate: 'duplicate',
  Fraudulent: 'fraudulent',
  OrderCanceled: 'order_canceled',
  ItemReturned: 'item_returned',
  ItemDamaged: 'item_damaged',
  ItemNotReceived: 'item_not_received',
  ItemNotAsDescribed: 'item_not_as_described',
  Custom: 'custom',
} as const;
export type RefundReason = (typeof RefundReasons)[keyof typeof RefundReasons];

export const RefundStatuses = {
  Canceled: 'canceled',
  Failed: 'failed',
  Pending: 'pending',
  Processing: 'processing',
  Succeeded: 'succeeded',
} as const;
export type RefundStatus = (typeof RefundStatuses)[keyof typeof RefundStatuses];

export const RefundFailureReasons = {
  InsufficientBalance: 'insufficient_balance',
  OriginalPaymentMethodUnavailable: 'original_payment_method_unavailable',
  OriginalPaymentNotRefundable: 'original_payment_not_refundable',
  RefundNotSupported: 'refund_not_supported',
  AmountNotSupported: 'amount_not_supported',
  RefundDeclined: 'refund_declined',
  RefundNotPermitted: 'refund_not_permitted',
  TemporarilyUnavailable: 'temporarily_unavailable',
  Unknown: 'unknown',
} as const;
export type RefundFailureReason = (typeof RefundFailureReasons)[keyof typeof RefundFailureReasons];

export interface RefundFailure {
  reason: RefundFailureReason;
  detail: string;
  retryable: boolean;
}

export interface CreateRefundLineItem {
  orderLineItemId: string;
  refundAmount: AmountParams;
  reason?: RefundReason;
  reasonDetails?: string;
}

export interface CreateRefundRequest {
  lineItems: CreateRefundLineItem[];
  orderId: string;
  reason: RefundReason;
  customData?: CustomData;
  reasonDetails?: string;
  reference?: string;
  requestMeta?: RequestMeta;
}

export interface CancelRefundRequest {
  refundId: string;
  reason?: string;
  requestMeta?: RequestMeta;
}

export interface LookupRefundRequest {
  refundId: string;
}

export interface PageRefundsRequest {
  pageNumber: number;
  pageSize?: number;
}

export interface RefundLineItem {
  id: string;
  orderLineItemId: string;
  originalAmountPaid: Amount;
  refundAmount: Amount;
  reason?: RefundReason;
  reasonDetails?: string;
}

export interface Refund {
  createdAt: Date;
  id: string;
  lineItems: RefundLineItem[];
  orderId: string;
  reason: RefundReason;
  status: RefundStatus;
  total: Amount;
  canceledAt?: Date;
  cancelReason?: string;
  customData?: CustomData;
  failure?: RefundFailure;
  failedAt?: Date;
  processingAt?: Date;
  orderAmount?: Amount;
  reasonDetails?: string;
  reference?: string;
  succeededAt?: Date;
}

export interface RefundPage {
  number: number;
  refunds: Refund[];
  size: number;
}
