import type { BalanceTransaction } from './balance-transactions';
import type { Amount } from './money';
import type { MobileMoneyNetwork, PaymentMethodType } from './payment-methods';

export const PaymentStatuses = {
  Initiated: 'initiated',
  RequiresAction: 'requires_action',
  Overdue: 'overdue',
  Executed: 'executed',
  Paid: 'paid',
  Canceled: 'canceled',
  Expired: 'expired',
  Failed: 'failed',
  Unknown: 'unknown',
} as const;
export type PaymentStatus = (typeof PaymentStatuses)[keyof typeof PaymentStatuses];

export const PaymentAttemptStatuses = {
  Initiated: 'initiated',
  Executed: 'executed',
  Succeeded: 'succeeded',
  Canceled: 'canceled',
  Expired: 'expired',
  Failed: 'failed',
  Unknown: 'unknown',
} as const;
export type PaymentAttemptStatus =
  (typeof PaymentAttemptStatuses)[keyof typeof PaymentAttemptStatuses];

export const PaymentConfirmationChannels = { Sms: 'sms', Email: 'email', Push: 'push' } as const;
export type PaymentConfirmationChannel =
  (typeof PaymentConfirmationChannels)[keyof typeof PaymentConfirmationChannels];

export const CheckoutPaymentStatuses = {
  RequiresAction: 'requires_action',
  Processing: 'processing',
  Succeeded: 'succeeded',
  Failed: 'failed',
  Cancelled: 'cancelled',
} as const;
export type CheckoutPaymentStatus =
  (typeof CheckoutPaymentStatuses)[keyof typeof CheckoutPaymentStatuses];

export const PaymentResultStatuses = {
  Pending: 'pending',
  RequiresConfirmation: 'requires_confirmation',
  Processing: 'processing',
  Succeeded: 'succeeded',
  Failed: 'failed',
} as const;
export type PaymentResultStatus =
  (typeof PaymentResultStatuses)[keyof typeof PaymentResultStatuses];

export interface PaymentPayoutConfiguration {
  enableFx: boolean;
  destination: {
    financialAccountId: string;
  };
}

export interface PaymentAttemptError {
  message: string;
}

export interface PaymentAttempt {
  paymentMethodType?: PaymentMethodType;
  paymentMethodId?: string;
  error?: PaymentAttemptError;
  reference?: string;
  status: PaymentAttemptStatus;
  initiatedAt: Date;
  succeededAt?: Date;
}

export interface PaymentAddress {
  name?: string;
  phoneNumber?: string;
  line1?: string;
  line2?: string;
  city?: string;
  region?: string;
  postCode?: string;
  country: string;
}

export interface PaymentCustomer {
  id: string;
  emailAddress?: string;
  guest: boolean;
  name: string;
  phoneNumber?: string;
  billingAddress?: PaymentAddress;
  shippingAddress?: PaymentAddress;
}

export interface PaymentMethodSnapshotOwner {
  name: string;
  address?: PaymentAddress;
}

export interface PaymentMethodSnapshot {
  id: string;
  bankAccount?: {
    type: string;
    ghanaBankAccount?: {
      accountNumber: string;
      branch?: string;
      name?: string;
      sortCode?: string;
      swiftCode?: string;
    };
  };
  card?: Readonly<Record<string, never>>;
  createdAt: Date;
  customerId: string;
  mobileMoney?: {
    network: MobileMoneyNetwork;
    accountNumber: string;
    last4: string;
  };
  owner?: PaymentMethodSnapshotOwner;
  type: PaymentMethodType;
  verified: boolean;
  verifiedAt?: Date;
}

export interface PaymentBillingDetails {
  owner?: PaymentMethodSnapshotOwner;
}

export interface PaymentError {
  message: string;
  docsUrl: string;
  source: string;
  type: string;
  code: string;
}

/** Receipt issued for a paid order payment. */
export interface PaymentReceipt {
  number?: string;
  format: {
    web: { url: string };
    pdf: { url: string };
  };
  deliverySummary?: Record<string, unknown>;
}

/** A payment collected for an order. */
export interface Payment {
  id: string;
  statementDescriptor: string;
  paymentMethodTypes?: string[];
  paymentMethod?: PaymentMethodSnapshot;
  billingDetails?: PaymentBillingDetails;
  customer?: PaymentCustomer;
  receipt?: PaymentReceipt;
  latestAttempt?: PaymentAttempt;
  amount: Amount;
  nextAction?: PaymentNextAction | null;
  latestError?: PaymentError;
  balanceTransaction?: BalanceTransaction | null;
  payoutConfiguration?: PaymentPayoutConfiguration | null;
  status: PaymentStatus;
  initiatedAt: Date;
  executedAt?: Date;
  dueAt?: Date;
  canceledAt?: Date;
  expiredAt?: Date;
  paidAt?: Date;
  paidOffline?: boolean;
  failedAt?: Date;
}

/** Deterministic questions about a payment response. */
export const Payment = {
  /** Whether the payment completed successfully. */
  isPaid(payment: Payment): boolean {
    return payment.status === PaymentStatuses.Paid;
  },

  /** Whether the payment is waiting for customer or merchant action. */
  requiresAction(payment: Payment): boolean {
    return payment.status === PaymentStatuses.RequiresAction;
  },

  /** Whether the payment has reached a final state. */
  isTerminal(payment: Payment): boolean {
    return (
      payment.status === PaymentStatuses.Paid ||
      payment.status === PaymentStatuses.Canceled ||
      payment.status === PaymentStatuses.Expired ||
      payment.status === PaymentStatuses.Failed
    );
  },

  /** Action details when the payment currently requires action. */
  requiredAction(payment: Payment): PaymentNextAction | undefined {
    return payment.status === PaymentStatuses.RequiresAction
      ? (payment.nextAction ?? undefined)
      : undefined;
  },
} as const;

export const PaymentNextActionTypes = {
  ConfirmPayment: 'confirm_payment',
  Execute: 'execute',
  Redirect: 'redirect',
  AuthorizePayment: 'authorize_payment',
  RequestConfirmation: 'request_confirmation',
} as const;
export type PaymentNextActionType =
  (typeof PaymentNextActionTypes)[keyof typeof PaymentNextActionTypes];

export interface PaymentConfirmationRequest {
  id: string;
  recipient: string;
  sentVia: PaymentConfirmationChannel;
  tokenSize: number;
  senderId: string;
  status?: string;
}

export interface PaymentConfirmationAttempt {
  status: string;
  confirmed: boolean;
  reason: string;
  executedAt?: Date;
  createdAt: Date;
}

export interface PaymentNextAction {
  type: PaymentNextActionType;
  confirmPayment?: {
    expiresAt: Date;
    scheme: string;
    request?: PaymentConfirmationRequest;
    attempt?: PaymentConfirmationAttempt;
    confirmed: boolean;
    status: string;
  };
  redirect?: {
    validUntil: Date;
    latestVisit?: {
      userAgent: string;
      ipAddress: string;
      at: Date;
    };
    redirectUrl: string;
  };
  authorize?: {
    beneficiary: string;
    expiresAt: Date;
    scheme: string;
  };
  requestConfirmation?: {
    lastRequest?: PaymentConfirmationRequest;
    after?: Date;
  };
}
