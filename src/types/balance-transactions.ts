import type { Amount } from './money';

export interface PageBalanceTransactionsRequest {
  pageNumber?: number;
  pageSize?: number;
}

export interface LookupBalanceTransactionRequest {
  transactionId: string;
}

export interface PayoutConfiguration {
  enableFx: false;
  destination: {
    financialAccountId: string;
  };
}

export const BalanceTransactionTypes = { Payment: 'payment', Refund: 'refund' } as const;
export type BalanceTransactionType =
  (typeof BalanceTransactionTypes)[keyof typeof BalanceTransactionTypes];

export const BalanceTransactionAllocationStatuses = {
  Pending: 'pending',
  Completed: 'completed',
} as const;
export type BalanceTransactionAllocationStatus =
  (typeof BalanceTransactionAllocationStatuses)[keyof typeof BalanceTransactionAllocationStatuses];

interface BalanceTransactionAllocationBase {
  id: string;
  status: BalanceTransactionAllocationStatus;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

export interface BalanceTransactionRefundAllocation extends BalanceTransactionAllocationBase {
  type: 'refund';
  refund: {
    id: string;
    amount: Amount;
  };
  payout?: never;
}

export interface BalanceTransactionPayoutAllocation extends BalanceTransactionAllocationBase {
  type: 'payout';
  payout: {
    id: string;
    amount: Amount;
  };
  refund?: never;
}

export type BalanceTransactionAllocation =
  BalanceTransactionRefundAllocation | BalanceTransactionPayoutAllocation;

interface BalanceTransactionBase {
  id: string;
  type: BalanceTransactionType;
  /** @deprecated Inspect allocations because one payment transaction can fund many payouts. */
  payoutId?: string;
  orderId: string;
  amount: Amount;
  createdAt: Date;
  availableAt?: Date;
  /** @deprecated Inspect allocations for current payout participation. */
  claimedAt?: Date;
  /** @deprecated Inspect completed allocations for consumed amounts. */
  paidAt?: Date;
  payoutConfiguration?: PayoutConfiguration | null;
}

export interface PaymentBalanceTransaction extends BalanceTransactionBase {
  type: 'payment';
  paymentId: string;
  refundId?: never;
  allocations?: BalanceTransactionAllocation[];
  availableAmount?: Amount;
  pendingAmount?: Amount;
  spentAmount?: Amount;
}

export interface RefundBalanceTransaction extends BalanceTransactionBase {
  type: 'refund';
  refundId: string;
  paymentId?: never;
  allocations?: never;
  availableAmount?: never;
  pendingAmount?: never;
  spentAmount?: never;
}

export type BalanceTransaction = PaymentBalanceTransaction | RefundBalanceTransaction;

export interface BalanceTransactionPage {
  number: number;
  size: number;
  transactions?: BalanceTransaction[];
}
