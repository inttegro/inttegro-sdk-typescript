import type { CustomData } from './custom-data';
import type { Amount } from './money';
import type { Price, PriceParams } from './prices';
import type { ProductType } from './products';
import type { RequestMeta } from './requests';
import { PaymentMethodData, MobileMoneyNetwork } from './payment-methods';
import { Address, CustomerData } from './customer';
import type { BankAccountConfig } from './bank-accounts';
import type { DoshAccount, FinancialAccountType } from './financial-accounts';
import type { WalletType } from './wallets';
import { Payment, type PaymentNextAction } from './payments';
import type { Refund } from './refunds';

export const LineItemTypes = {
  Product: 'product',
  Fee: 'fee',
  Shipping: 'shipping',
  Discount: 'discount',
} as const;
export type LineItemType = (typeof LineItemTypes)[keyof typeof LineItemTypes];

export const OrderDocumentKinds = { Invoice: 'invoice', Receipt: 'receipt' } as const;
export type OrderDocumentKind = (typeof OrderDocumentKinds)[keyof typeof OrderDocumentKinds];

export const DeliveryChannels = { Email: 'email', Sms: 'sms' } as const;
export type DeliveryChannel = (typeof DeliveryChannels)[keyof typeof DeliveryChannels];

export const CheckoutOrderStatuses = {
  Preparing: 'preparing',
  RequiresPayment: 'requires_payment',
  Completed: 'completed',
  Canceled: 'canceled',
  Expired: 'expired',
} as const;
export type CheckoutOrderStatus =
  (typeof CheckoutOrderStatuses)[keyof typeof CheckoutOrderStatuses];

export const OrderCreatedFromResourceTypes = { PurchaseIntent: 'purchase_intent' } as const;
export type OrderCreatedFromResourceType =
  (typeof OrderCreatedFromResourceTypes)[keyof typeof OrderCreatedFromResourceTypes];

/**
 * Product line item
 */
export interface ProductLineItemParams {
  /** Catalog product IDs are not valid on an inline product snapshot. */
  productId?: never;
  /** Catalog price IDs are not valid on an inline product snapshot. */
  priceId?: never;
  /** Internal product ID for reconciliation */
  id?: string;
  /** Product type */
  type: ProductType;
  /** Quantity of the product */
  quantity: number;
  /** Description of the product */
  about?: string;
  /** External reference for the product */
  reference?: string;
  /** Product name */
  name: string;
  /** Tax code (optional) */
  taxCode?: string;
  /** Product price */
  price: PriceParams;
  /** Arbitrary custom data */
  customData?: CustomData;
}

/** Catalog product line item with a transaction-specific price. */
export interface CatalogProductWithPriceDataParams {
  /** Existing catalog product to snapshot onto the order line item. */
  productId: string;
  /** How many units of the catalog product the customer is purchasing. */
  quantity: number;
  /** Explicit price for this transaction. */
  price: PriceParams;
  priceId?: never;
  id?: never;
  type?: never;
  about?: never;
  reference?: never;
  name?: never;
  taxCode?: never;
  customData?: never;
}

/** Catalog product line item using an existing price belonging to the product. */
export interface CatalogProductWithPriceReferenceParams {
  /** Existing catalog product to snapshot onto the order line item. */
  productId: string;
  /** Existing active price belonging to the catalog product. */
  priceId: string;
  /** How many units of the catalog product the customer is purchasing. */
  quantity: number;
  price?: never;
  id?: never;
  type?: never;
  about?: never;
  reference?: never;
  name?: never;
  taxCode?: never;
  customData?: never;
}

export type ProductDetailsParams =
  | ProductLineItemParams
  | CatalogProductWithPriceDataParams
  | CatalogProductWithPriceReferenceParams;

/**
 * Fee line item
 */
export interface FeeLineItemParams {
  /** Fee identifier */
  id?: string;
  /** Customer-facing label */
  label?: string;
  /** Fee amount */
  amount: import('./money').AmountParams;
  /** Fee description */
  description?: string;
  /** Tax classification code */
  taxCode?: string;
  /** Fee reference */
  reference?: string;
  /** Arbitrary custom data */
  customData?: CustomData;
}

/**
 * Line item - can be a product or a fee
 */
export interface ShippingLineItemParams {
  id?: string;
  label?: string;
  fee: import('./money').AmountParams;
  taxCode?: string;
  customData?: CustomData;
}

export type LineItemParams =
  | {
      type: 'product';
      product: ProductDetailsParams;
    }
  | {
      type: 'fee';
      fee: FeeLineItemParams;
    }
  | {
      type: 'shipping';
      shipping: ShippingLineItemParams;
    };

export interface ProductLineItem {
  id: string;
  productId?: string;
  priceId?: string;
  reference?: string;
  about?: string;
  customData?: CustomData;
  taxCode?: string;
  name: string;
  category?: string;
  type?: ProductType;
  price: Price;
  quantity: number;
}

export interface FeeLineItem {
  id: string;
  description?: string;
  taxCode?: string;
  amount: Amount;
  label: string;
}

export interface ShippingLineItem {
  id: string;
  taxCode?: string;
  label?: string;
  fee: Amount;
}

export type DiscountLineItem = Readonly<Record<string, never>>;

export type LineItem =
  | { type: 'product'; product: ProductLineItem }
  | { type: 'fee'; fee: FeeLineItem }
  | { type: 'shipping'; shipping: ShippingLineItem }
  | { type: 'discount'; discount: DiscountLineItem };

/**
 * Billing details for an order
 */
export interface BillingDetails {
  /** Billing email address */
  emailAddress: string;
  /** Billing phone number */
  phoneNumber: string;
  /** Billing name */
  name: string;
  /** Billing address */
  address: Address;
}

/**
 * Shipping information
 */
export interface Shipping {
  /** Shipping address */
  address: Address;
}

/**
 * Shipping line item details
 */
export interface ShippingDetails {
  /** Shipping ID */
  id?: string;
  /** Shipping label */
  label?: string;
  /** Shipping fee */
  fee: Amount;
  /** Tax code */
  taxCode?: string;
  /** Arbitrary custom data */
  customData?: CustomData;
}

/**
 * Order-specific payout destination configuration
 */
export interface OrderPayoutSettings {
  /** Payout destination for this order */
  destination?: {
    /** ID of an existing financial account to receive payout */
    financialAccountId?: string;
    /** Inline financial account details for payout destination */
    financialAccountData?: {
      type: FinancialAccountType;
      wallet?: {
        type: WalletType;
        mobileMoney?: {
          accountNumber: string;
          network: MobileMoneyNetwork;
        };
      } | null;
      bankAccount?: BankAccountConfig | null;
      doshAccount?: DoshAccount | null;
    };
  };
  /** Whether to enable foreign exchange conversion for this order's payout */
  enableFx?: boolean;
}

/**
 * Order-level invoice rendering settings
 */
export interface InvoiceSettings {
  /** Optional invoice number */
  number?: string;
  /** Optional invoice memo */
  memo?: string;
  /** Optional invoice footer */
  footer?: string;
  /** Invoice-specific custom metadata */
  customData?: CustomData;
}

/**
 * Base order creation request
 */
interface BaseCreateOrderRequest {
  /** Line items (products or fees) */
  lineItems: LineItemParams[];
  /** Billing details */
  billingDetails?: BillingDetails;
  /** Shipping information (required for physical products) */
  shipping?: Shipping;
  /** Custom order number */
  number?: string;
  /** Optional receipt number for downstream reconciliation */
  receiptNumber?: string;
  /** Statement descriptor for payment */
  statementDescriptor?: string;
  /** Static prefix, 2-10 characters, used to build statement descriptor as prefix*order_id. Mutually exclusive with statement_descriptor. */
  statementDescriptorPrefix?: string;
  /** Whether to immediately execute payment */
  executePayment?: boolean;
  /** Whether to explicitly finalize the order regardless of payment execution */
  finalize?: boolean;
  /** Request metadata such as idempotency controls */
  requestMeta?: RequestMeta;
  /** Checkout redirect/cancel URLs */
  checkoutSettings?: {
    redirectUrl?: string;
    cancelUrl?: string;
  };
  /** Invoice rendering metadata */
  invoiceSettings?: InvoiceSettings;
  /** Order-level custom metadata */
  customData?: CustomData;
  /** Order-specific payout settings */
  payoutSettings?: OrderPayoutSettings;
}

/**
 * Create order request with new customer data
 */
export interface CreateOrderWithCustomerRequest extends BaseCreateOrderRequest {
  /** Customer data for new customer */
  customerData: CustomerData;
  /** Customer ID should not be present when creating with customer data */
  customerId?: never;
  /** Payment method ID should not be present when creating with customer data */
  paymentMethodId?: never;
  /** Optional inline payment method details to tokenize and attach */
  paymentMethodData?: PaymentMethodData;
}

/**
 * Create order request with existing customer ID
 */
export interface CreateOrderWithCustomerIdRequest extends BaseCreateOrderRequest {
  /** Existing customer ID */
  customerId: string;
  /** Optional pre-saved payment method ID */
  paymentMethodId?: string;
  /** Optional inline payment method details to tokenize and attach */
  paymentMethodData?: PaymentMethodData;
  /** Customer data should not be present when using existing customer */
  customerData?: never;
}

/**
 * Create order request - union of both variants
 */
export type CreateOrderRequest = CreateOrderWithCustomerRequest | CreateOrderWithCustomerIdRequest;

/**
 * Lookup order request
 */
export interface LookupOrderRequest {
  /** Order ID to lookup */
  orderId: string;
}

/**
 * Update order request
 */
export interface UpdateOrderRequest {
  /** Order ID to update */
  orderId: string;
  /** Clear the currently attached payment method */
  clearPaymentMethod?: boolean;
  /** Replacement order-level custom metadata */
  customData?: CustomData;
  /** Invoice rendering metadata */
  invoiceSettings?: InvoiceSettings;
  /** Explicit seal decision */
  finalize?: boolean;
  /** Full replacement for the order's line items */
  lineItems?: LineItemParams[];
  /** Replacement order number */
  number?: string;
  /** Replacement receipt number */
  receiptNumber?: string;
  /** Inline payment method details to tokenize and attach */
  paymentMethodData?: PaymentMethodData;
  /** Saved payment method ID to attach */
  paymentMethodId?: string;
  /** Replacement payment statement descriptor */
  statementDescriptor?: string;
  /** Replacement payment statement descriptor prefix */
  statementDescriptorPrefix?: string;
}

/**
 * Pay for order with saved payment method
 */
export interface PayOrderRequest {
  /** Order ID to pay for */
  orderId: string;
  /** Request metadata such as idempotency controls */
  requestMeta?: RequestMeta;
  /** Optional saved payment method to use */
  paymentMethodId?: string;
  /** Whether payment was already collected offline */
  paidOutOfBand?: boolean;
  /** Payment method data should not be present when using saved method */
  paymentMethodData?: never;
}

/**
 * Pay for order with inline payment method data
 */
export interface PayOrderWithMethodRequest {
  /** Order ID to pay for */
  orderId: string;
  /** Request metadata such as idempotency controls */
  requestMeta?: RequestMeta;
  /** Payment method data */
  paymentMethodData: PaymentMethodData;
}

/**
 * Pay order request - union of both variants
 */
export type PayOrder = PayOrderRequest | PayOrderWithMethodRequest;

/**
 * Confirm payment request
 */
export interface ConfirmPaymentRequest {
  /** Order ID */
  orderId: string;
  /** Request metadata such as idempotency controls */
  requestMeta?: RequestMeta;
  /** Payment being confirmed */
  paymentId: string;
  /** Confirmation challenge being answered */
  confirmationId: string;
  /** Confirmation token (e.g., OTP) */
  token: string;
}

/**
 * Request confirmation request
 */
export interface RequestConfirmationRequest {
  /** Order ID */
  orderId: string;
  /** Request metadata such as idempotency controls */
  requestMeta?: RequestMeta;
}

/**
 * Finalize order request
 */
export interface FinalizeOrderRequest {
  /** Order ID to finalize */
  orderId: string;
  /** Request metadata such as idempotency controls */
  requestMeta?: RequestMeta;
}

/**
 * Complete order request
 */
export interface CompleteOrderRequest {
  /** Order ID to complete */
  orderId: string;
  /** Whether payment was collected out of band */
  paidOutOfBand?: boolean;
}

/**
 * Cancel order request
 */
export interface CancelOrderRequest {
  /** Order ID to cancel */
  orderId: string;
  /** Request metadata such as idempotency controls */
  requestMeta?: RequestMeta;
  /** Optional cancellation reason */
  reason?: string;
  /** Record whether a refund was requested as part of the cancellation */
  executeRefund?: boolean;
}

/**
 * Order status
 */
export const OrderStatuses = {
  Preparing: 'preparing',
  RequiresPayment: 'requires_payment',
  Paid: 'paid',
  Completed: 'completed',
  Canceled: 'canceled',
  Expired: 'expired',
  Unknown: 'unknown',
} as const;
export type OrderStatus = (typeof OrderStatuses)[keyof typeof OrderStatuses];

/**
 * Checkout settings
 */
export interface CheckoutSettings {
  redirectUrl?: string;
  cancelUrl?: string;
}

/**
 * Line item group summarizing items and totals
 */
export interface LineItemGroup {
  lineItems: LineItem[];
  total: Amount;
}

/**
 * Invoice format details
 */
export interface InvoiceFormatDetails {
  url: string;
}

export interface Invoice {
  number?: string;
  format: {
    web: InvoiceFormatDetails;
    pdf: InvoiceFormatDetails;
    receipt?: InvoiceFormatDetails;
  };
}

export interface OrderAddress {
  name?: string;
  phoneNumber?: string;
  line1?: string;
  line2?: string;
  city?: string;
  region?: string;
  postCode?: string;
  country: string;
}

export interface OrderCustomer {
  id: string;
  emailAddress?: string;
  guest: boolean;
  name: string;
  phoneNumber?: string;
  billingAddress?: OrderAddress;
  shippingAddress?: OrderAddress;
}

export interface OrderCreatedFrom {
  source?: string;
  resourceType?: OrderCreatedFromResourceType;
  resourceId?: string;
}

/**
 * Order response object
 */
export interface Order {
  id: string;
  status: OrderStatus;
  number?: string;
  receiptNumber?: string;
  reference?: string;
  customer: OrderCustomer;
  checkoutSettings?: CheckoutSettings;
  invoiceSettings?: InvoiceSettings;
  invoice?: Invoice;
  lineItemGroup?: LineItemGroup;
  payment?: Payment;
  customData?: CustomData | null;
  createdFrom?: OrderCreatedFrom;
  initiatedAt: Date;
  sealedAt?: Date;
  completedAt?: Date;
  paidAt?: Date;
  canceledAt?: Date;
  expiresAt?: Date;
  paymentDueAt?: Date;
  refunds?: Refund[];
}

/** Deterministic questions about an order response. */
export const Order = {
  /** Whether the order has recorded payment, including a subsequently completed order. */
  isPaid(order: Order): boolean {
    return order.status === OrderStatuses.Paid || order.paidAt != null;
  },

  /** Whether the order is waiting for payment. */
  requiresPayment(order: Order): boolean {
    return order.status === OrderStatuses.RequiresPayment;
  },

  /** Whether the order has reached a final state. */
  isTerminal(order: Order): boolean {
    return (
      order.status === OrderStatuses.Paid ||
      order.status === OrderStatuses.Completed ||
      order.status === OrderStatuses.Canceled ||
      order.status === OrderStatuses.Expired
    );
  },

  /** Nested payment action details, when the order's payment requires action. */
  requiredPaymentAction(order: Order): PaymentNextAction | undefined {
    return order.payment ? Payment.requiredAction(order.payment) : undefined;
  },
} as const;

/** Send order document request */
export interface OrderDocumentDeliveryRequest {
  orderId: string;
}

/** Order document delivery attempt */
export interface OrderDocumentDeliveryAttempt {
  channel: string;
  chimeId?: string;
  error?: string;
}

/** Order document delivery details */
export interface OrderDocumentDelivery {
  documentKind: string;
  documentUrl: string;
  sentChannels: string[];
  failedChannels?: string[];
  deliveries?: OrderDocumentDeliveryAttempt[];
  failures?: OrderDocumentDeliveryAttempt[];
}

/** Result of sending an order document. */
export interface OrderDocumentDeliveryResult {
  order: Order;
  delivery: OrderDocumentDelivery;
}

/** Page orders request */
export interface PageOrdersRequest {
  pageNumber?: number;
  pageSize?: number;
  customerId?: string;
}

/** A page of orders returned by the Orders resource. */
export interface OrderPage {
  number: number;
  size: number;
  orders: Order[];
}
