/**
 * Orders resource for creating and managing orders and payments.
 *
 * Orders represent a complete transaction with line items, customer information, and payment details.
 * Use this resource to create orders, process payments, handle confirmations, and manage the order lifecycle.
 *
 * @example
 * ```typescript
 * const inttegro = new Inttegro(process.env.INTTEGRO_API_KEY!);
 *
 * // Create order with new customer and payment method
 * const order = await inttegro.orders.create({
 *   customerData: {
 *     name: 'Gloria Kesewaa',
 *     emailAddress: 'gloria@example.com',
 *     phoneNumber: '+233544998605',
 *   },
 *   lineItems: [{
 *     type: 'product',
 *     product: {
 *       type: 'physical',
 *       name: 'Utility Sneakers',
 *       quantity: 1,
 *       price: { currency: 'ghs', value: 20000 },
 *     },
 *   }],
 *   paymentMethodData: {
 *     type: 'mobile_money',
 *     mobileMoney: {
 *       network: 'mtn',
 *       accountNumber: '0544998605',
 *     },
 *   },
 *   executePayment: true,
 * });
 * ```
 *
 * @see https://studio.inttegro.com/orders for detailed guides
 */

import { HttpClient, InttegroResponse } from '../http-client';
import {
  CreateOrderRequest,
  LookupOrderRequest,
  UpdateOrderRequest,
  PayOrder,
  ConfirmPaymentRequest,
  RequestConfirmationRequest,
  FinalizeOrderRequest,
  OrderDocumentDeliveryRequest,
  OrderDocumentDeliveryResult,
  CompleteOrderRequest,
  CancelOrderRequest,
  PageOrdersRequest,
  Order,
  OrderPage,
  ResourceSearchPage,
  ResourceSearchRequest,
} from '../types';
import { validateRequired, throwIfValidationErrors } from '../utils/validation';

interface OrderEnvelope {
  order: Order;
}

interface OrderPageEnvelope {
  page: OrderPage;
}

/**
 * Orders resource for managing complete order lifecycle operations.
 */
export class Orders {
  constructor(private httpClient: HttpClient) {}

  /**
   * Create a new order with line items, customer, and optional payment details.
   *
   * Creates an order representing a purchase. Supports two flows:
   * 1. New customer: Provide `customerData` to create a new customer and order
   * 2. Existing customer: Provide `customerId` and optionally `paymentMethodId` for known customers
   *
   * Set `executePayment` to `true` to immediately charge the customer after order creation. The order can
   * be configured with checkout redirect URLs for hosted payment flows.
   *
   * @param request - Order creation parameters
   * @param request.customerData - New customer information (required if `customerId` not provided)
   * @param request.customerId - Existing customer ID (required if `customerData` not provided)
   * @param request.lineItems - Array of products, fees, or shipping charges (required, minimum 1)
   * @param request.paymentMethodData - Inline payment method details (mobile money, card, etc.)
   * @param request.paymentMethodId - ID of saved payment method to use
   * @param request.executePayment - Whether to execute payment immediately (default: false)
   * @param request.finalize - Whether to explicitly finalize the order regardless of payment state (default: false)
   * @param request.requestMeta - Request controls such as `idempotencyKey`
   * @param request.number - Optional order number for reference (e.g., "ORDER-123")
   * @param request.statementDescriptor - Text that appears on customer's bank statement (max 22 characters)
   * @param request.statementDescriptorPrefix - Static prefix, 2-10 characters, used to build `prefix*order_id`; mutually exclusive with `statementDescriptor`
   * @param request.checkoutSettings - Checkout flow configuration with `redirectUrl` and `cancelUrl`
   * @param request.customData - Key-value custom data (max 25KB, keys and values must be strings)
   *
   * @returns Created order with customer, line items, payment intent (if applicable), and optional redirect URL
   *
   * @throws {ValidationError} If required fields are missing or invalid
   * @throws {ApiError} If the API request fails
   *
   * @example
   * ```typescript
   * // Create order with new customer and execute payment
   * const order = await inttegro.orders.create({
   *   requestMeta: {
   *     idempotencyKey: 'order_2025_001',
   *   },
   *   executePayment: true,
   *   customerData: {
   *     name: 'Gloria Kesewaa',
   *     emailAddress: 'gloria@example.com',
   *     phoneNumber: '+233544998605',
   *   },
   *   paymentMethodData: {
   *     type: 'mobile_money',
   *     mobileMoney: {
   *       network: 'mtn',
   *       accountNumber: '0544998605',
   *     },
   *   },
   *   lineItems: [{
   *     type: 'product',
   *     product: {
   *       type: 'physical',
   *       name: 'Utility Sneakers',
   *       quantity: 1,
   *       price: { currency: 'ghs', value: 20000 },
   *     },
   *   }],
   *   checkoutSettings: {
   *     redirectUrl: 'https://example.com/order/complete',
   *     cancelUrl: 'https://example.com/order/cancelled',
   *   },
   * });
   *
   * console.log(`Created order: ${order.id}`);
   * ```
   *
   * @example
   * ```typescript
   * // Create order with existing customer for later payment
   * const order = await inttegro.orders.create({
   *   customerId: 'cu_abc123',
   *   lineItems: [{
   *     type: 'product',
   *     product: {
   *       type: 'digital',
   *       name: 'Premium Subscription',
   *       quantity: 1,
   *       price: { currency: 'ghs', value: 5000 },
   *     },
   *   }],
   * });
   * ```
   *
   * @see https://studio.inttegro.com/accept-a-payment for payment flow guide
   * @see https://studio.inttegro.com/order-lifecycle for order states
   */
  async create(request: CreateOrderRequest): Promise<Order> {
    validateCreateOrderRequest(request);

    const response = await this.httpClient.post<OrderEnvelope>('/orders/create', request);
    return response.order;
  }

  /**
   * Create a new order and keep native HTTP response facts with the decoded order.
   */
  async createWithResponse(request: CreateOrderRequest): Promise<InttegroResponse<Order>> {
    validateCreateOrderRequest(request);

    return this.httpClient.postResourceWithResponse<Order>('/orders/create', 'order', request);
  }

  /**
   * Retrieve an existing order by its ID.
   *
   * Returns full order details including customer, line items, payment state, and invoice information.
   * Use this to check order status, retrieve payment details, or display order confirmation to customers.
   *
   * @param request - Lookup parameters
   * @param request.orderId - Unique identifier of the order to retrieve (required)
   *
   * @returns Complete order object with all related data
   *
   * @throws {ApiError} If order not found or request fails
   *
   * @example
   * ```typescript
   * const order = await inttegro.orders.lookup({
   *   orderId: 'GKj7A8lM5wEGRUvbqpI4bkDFsQvpqVyh5fqePNnb',
   * });
   *
   * console.log(`Order status: ${order.status}`);
   * console.log(`Payment status: ${order.payment?.status}`);
   * ```
   *
   * @see https://studio.inttegro.com/orders for API reference
   */
  async lookup(request: LookupOrderRequest): Promise<Order> {
    // Validate required fields
    const errors = validateRequired(request as unknown as Record<string, unknown>, ['order_id']);
    throwIfValidationErrors(errors);

    const response = await this.httpClient.post<OrderEnvelope>('/orders/lookup', request);
    return response.order;
  }

  /**
   * Update mutable order metadata, line items, invoice settings, or attached payment method.
   */
  async update(request: UpdateOrderRequest): Promise<Order> {
    const errors = validateRequired(request as unknown as Record<string, unknown>, ['order_id']);
    throwIfValidationErrors(errors);

    const response = await this.httpClient.post<OrderEnvelope>('/orders/update', request);
    return response.order;
  }

  /**
   * Initiate payment for an existing order.
   *
   * Supports three payment flows:
   * 1. Saved payment method: Provide only `orderId` to charge a previously saved payment method
   * 2. New payment method: Include `paymentMethodData` with inline payment details (mobile money, card, etc.)
   * 3. Offline payment: Set `paidOutOfBand` to true for cash, bank transfer, or check payments
   *
   * When payment requires customer confirmation (e.g., OTP), the returned order includes a `nextAction` field
   * indicating what the customer needs to do. Call `confirmPayment()` once the customer provides the token.
   *
   * @param request - Payment parameters
   * @param request.orderId - Unique identifier of the order to pay (required)
   * @param request.paymentMethodData - Inline payment method details (mobile money, card, bank, etc.)
   * @param request.paymentMethodId - ID of a saved payment method to use
   * @param request.paidOutOfBand - Set to true if payment was received outside Inttegro (default: false)
   * @param request.requestMeta - Request controls such as `idempotencyKey`
   *
   * @returns Updated order with typed payment and next-action state
   *
   * @throws {ApiError} If order not found or payment fails
   *
   * @example
   * ```typescript
   * // Pay with inline mobile money
   * const order = await inttegro.orders.pay({
   *   orderId: 'GKj7A8lM5wEGRUvbqpI4bkDFsQvpqVyh5fqePNnb',
   *   paymentMethodData: {
   *     type: 'mobile_money',
   *     mobileMoney: {
   *       network: 'mtn',
   *       accountNumber: '0544998605',
   *     },
   *   },
   * });
   *
   * if (order.payment?.nextAction?.type === 'confirm_payment') {
   *   // Customer needs to provide OTP sent to their phone
   *   const token = await promptCustomerForOTP();
   *   await inttegro.orders.confirmPayment({
   *     orderId: order.id,
   *     paymentId: order.payment.id,
   *     confirmationId: order.payment.nextAction.confirmPayment.request.id,
   *     token,
   *   });
   * }
   * ```
   *
   * @example
   * ```typescript
   * // Pay with saved payment method
   * const order = await inttegro.orders.pay({
   *   orderId: 'GKj7A8lM5wEGRUvbqpI4bkDFsQvpqVyh5fqePNnb',
   *   paymentMethodId: 'pm_xyz123abc456',
   *   requestMeta: {
   *     idempotencyKey: 'order_initial_charge_001',
   *   },
   * });
   * ```
   *
   * @example
   * ```typescript
   * // Mark as paid offline (cash, bank transfer, etc.)
   * const order = await inttegro.orders.pay({
   *   orderId: 'GKj7A8lM5wEGRUvbqpI4bkDFsQvpqVyh5fqePNnb',
   *   paidOutOfBand: true,
   * });
   * ```
   *
   * @see https://studio.inttegro.com/accept-a-payment for payment flow guide
   * @see https://studio.inttegro.com/charge-repeat-customers for saved payment methods
   */
  async pay(request: PayOrder): Promise<Order> {
    // Validate required fields
    const errors = validateRequired(request as unknown as Record<string, unknown>, ['order_id']);
    throwIfValidationErrors(errors);

    const response = await this.httpClient.post<OrderEnvelope>('/orders/pay', request);
    return response.order;
  }

  /**
   * Confirm a pending payment using a verification token (e.g., OTP sent to customer's phone).
   *
   * Call this method when a payment requires customer confirmation and you've collected the verification
   * token from the customer. The token is typically a 6-digit OTP sent via SMS or email to the customer.
   *
   * @param request - Confirmation parameters
   * @param request.orderId - Unique identifier of the order being paid (required)
   * @param request.paymentId - Unique identifier of the payment being confirmed (required)
   * @param request.confirmationId - Unique identifier of the confirmation challenge (required)
   * @param request.token - Verification token provided by the customer (required, typically 6 digits)
   * @param request.requestMeta - Request controls such as `idempotencyKey`
   *
   * @returns Updated order with payment status
   *
   * @throws {ApiError} If token is invalid, expired, or order not found
   *
   * @example
   * ```typescript
   * // After receiving OTP from customer
   * const order = await inttegro.orders.confirmPayment({
   *   orderId: 'GKj7A8lM5wEGRUvbqpI4bkDFsQvpqVyh5fqePNnb',
   *   paymentId: 'py_abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMN',
   *   confirmationId: 'pc_abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMN',
   *   token: '123456',
   * });
   *
   * if (order.payment?.status === 'paid') {
   *   console.log('Payment confirmed successfully!');
   * }
   * ```
   *
   * @see https://studio.inttegro.com/accept-a-payment for complete payment flow
   */
  async confirmPayment(request: ConfirmPaymentRequest): Promise<Order> {
    // Validate required fields
    const errors = validateRequired(request as unknown as Record<string, unknown>, [
      'order_id',
      'payment_id',
      'confirmation_id',
      'token',
    ]);
    throwIfValidationErrors(errors);

    const response = await this.httpClient.post<OrderEnvelope>('/orders/confirm_payment', request);
    return response.order;
  }

  /**
   * Request a new confirmation token to be sent to the customer (e.g., resend OTP).
   *
   * Use this when the customer didn't receive the original OTP or the token expired. A fresh verification
   * token will be sent via SMS or email to the customer's registered contact information.
   *
   * @param request - Request parameters
   * @param request.orderId - Unique identifier of the order requiring confirmation (required)
   * @param request.requestMeta - Request controls such as `idempotencyKey`
   *
   * @returns Updated order
   *
   * @throws {ApiError} If order not found or not in confirmable state
   *
   * @example
   * ```typescript
   * // Resend OTP to customer
   * const order = await inttegro.orders.requestConfirmation({
   *   orderId: 'GKj7A8lM5wEGRUvbqpI4bkDFsQvpqVyh5fqePNnb',
   * });
   *
   * console.log('New OTP sent to customer');
   * ```
   *
   * @see https://studio.inttegro.com/accept-a-payment for payment confirmation flow
   */
  async requestConfirmation(request: RequestConfirmationRequest): Promise<Order> {
    // Validate required fields
    const errors = validateRequired(request as unknown as Record<string, unknown>, ['order_id']);
    throwIfValidationErrors(errors);

    const response = await this.httpClient.post<OrderEnvelope>(
      '/orders/request_confirmation',
      request
    );
    return response.order;
  }

  /**
   * Finalize an order to make it immutable and ready for payment or fulfillment.
   *
   * Finalizing (sealing) an order locks its line items and totals, making it ready for payment execution
   * or order completion. Most orders are finalized automatically, but you can explicitly finalize an
   * order if needed.
   *
   * @param request - Finalization parameters
   * @param request.orderId - Unique identifier of the order to finalize (required)
   * @param request.requestMeta - Request controls such as `idempotencyKey`
   *
   * @returns Finalized order object
   *
   * @throws {ApiError} If order not found or already finalized
   *
   * @example
   * ```typescript
   * const order = await inttegro.orders.finalize({
   *   orderId: 'GKj7A8lM5wEGRUvbqpI4bkDFsQvpqVyh5fqePNnb',
   * });
   *
   * console.log(`Order finalized at: ${order.sealedAt}`);
   * ```
   *
   * @see https://studio.inttegro.com/order-lifecycle for order states
   */
  async finalize(request: FinalizeOrderRequest): Promise<Order> {
    const errors = validateRequired(request as unknown as Record<string, unknown>, ['order_id']);
    throwIfValidationErrors(errors);

    const response = await this.httpClient.post<OrderEnvelope>('/orders/finalize', request);
    return response.order;
  }

  /**
   * Send the hosted invoice link for an existing order to the customer.
   *
   * Inttegro delivers the invoice link to every contact method available on the order customer.
   *
   * @param request - Send invoice parameters
   * @param request.orderId - Unique identifier of the order whose invoice should be sent (required)
   *
   * @returns The order and document delivery details
   *
   * @throws {ApiError} If order not found, customer has no contact method, or delivery fails
   */
  async sendInvoice(request: OrderDocumentDeliveryRequest): Promise<OrderDocumentDeliveryResult> {
    const errors = validateRequired(request as unknown as Record<string, unknown>, ['order_id']);
    throwIfValidationErrors(errors);

    return this.httpClient.post<OrderDocumentDeliveryResult>('/orders/send_invoice', request);
  }

  /**
   * Send the hosted receipt link for a paid order to the customer.
   *
   * Inttegro delivers receipts only after the order has been paid.
   *
   * @param request - Send receipt parameters
   * @param request.orderId - Unique identifier of the paid order whose receipt should be sent (required)
   *
   * @returns The order and document delivery details
   *
   * @throws {ApiError} If order not found, unpaid, customer has no contact method, or delivery fails
   */
  async sendReceipt(request: OrderDocumentDeliveryRequest): Promise<OrderDocumentDeliveryResult> {
    const errors = validateRequired(request as unknown as Record<string, unknown>, ['order_id']);
    throwIfValidationErrors(errors);

    return this.httpClient.post<OrderDocumentDeliveryResult>('/orders/send_receipt', request);
  }

  /**
   * Mark an order as completed, indicating fulfillment is done.
   *
   * Call this after you've shipped physical goods or delivered digital products to the customer.
   * Completing an order transitions it to its final state and can optionally mark payment as received
   * offline (out-of-band) if `paidOutOfBand` is set to true.
   *
   * @param request - Completion parameters
   * @param request.orderId - Unique identifier of the order to complete (required)
   * @param request.paidOutOfBand - Set to true if payment was received outside Inttegro (default: false)
   *
   * @returns Completed order object
   *
   * @throws {ApiError} If order not found, not paid, or already completed
   *
   * @example
   * ```typescript
   * // Complete order after fulfillment
   * const order = await inttegro.orders.complete({
   *   orderId: 'GKj7A8lM5wEGRUvbqpI4bkDFsQvpqVyh5fqePNnb',
   * });
   *
   * console.log(`Order completed at: ${order.completedAt}`);
   * ```
   *
   * @example
   * ```typescript
   * // Complete order with offline payment
   * const result = await inttegro.orders.complete({
   *   orderId: 'GKj7A8lM5wEGRUvbqpI4bkDFsQvpqVyh5fqePNnb',
   *   paidOutOfBand: true,
   * });
   * ```
   *
   * @see https://studio.inttegro.com/order-lifecycle for order states
   */
  async complete(request: CompleteOrderRequest): Promise<Order> {
    const errors = validateRequired(request as unknown as Record<string, unknown>, ['order_id']);
    throwIfValidationErrors(errors);

    const response = await this.httpClient.post<OrderEnvelope>('/orders/complete', request);
    return response.order;
  }

  /**
   * Cancel an order, stopping payment execution and preventing further processing.
   *
   * Canceling an order is irreversible and should be done when the customer requests cancellation or
   * the order cannot be fulfilled. If payment was already captured, you'll need to refund it separately.
   *
   * @param request - Cancellation parameters
   * @param request.orderId - Unique identifier of the order to cancel (required)
   * @param request.requestMeta - Request controls such as `idempotencyKey`
   *
   * @returns Cancelled order object
   *
   * @throws {ApiError} If order not found, already completed, or cannot be cancelled
   *
   * @example
   * ```typescript
   * const order = await inttegro.orders.cancel({
   *   orderId: 'GKj7A8lM5wEGRUvbqpI4bkDFsQvpqVyh5fqePNnb',
   * });
   *
   * console.log(`Order ${order.id} has been cancelled`);
   * ```
   *
   * @see https://studio.inttegro.com/order-lifecycle for order states
   */
  async cancel(request: CancelOrderRequest): Promise<Order> {
    const errors = validateRequired(request as unknown as Record<string, unknown>, ['order_id']);
    throwIfValidationErrors(errors);

    const response = await this.httpClient.post<OrderEnvelope>('/orders/cancel', request);
    return response.order;
  }

  /**
   * Retrieve a paginated list of orders.
   *
   * Returns orders in reverse chronological order (most recent first).
   *
   * @param request - Pagination and filter parameters (optional)
   * @param request.pageNumber - Zero-based page index to retrieve (0-10)
   * @param request.pageSize - Number of orders per page (1-256)
   * @param request.customerId - Optional customer whose orders should be returned
   *
   * @returns Paginated list of orders with pagination details
   *
   * @throws {ApiError} If pagination parameters are invalid
   *
   * @example
   * ```typescript
   * // Get first page of orders
   * const page = await inttegro.orders.page({
   *   pageSize: 25,
   *   pageNumber: 0,
   * });
   *
   * console.log(`Retrieved ${page.orders?.length ?? 0} orders`);
   * ```
   *
   * @example
   * ```typescript
   * // Restrict the page to one customer
   * const customerOrders = await inttegro.orders.page({
   *   customerId: 'cu_123',
   *   pageSize: 50,
   * });
   * ```
   *
   * @see https://studio.inttegro.com/pagination for pagination guide
   * @see https://studio.inttegro.com/orders for API reference
   */
  async page(request: PageOrdersRequest = {}): Promise<OrderPage> {
    const response = await this.httpClient.post<OrderPageEnvelope>('/orders/page', request);
    return response.page;
  }

  async search(request: ResourceSearchRequest): Promise<ResourceSearchPage> {
    return this.httpClient.postResource<ResourceSearchPage>('/orders/search', 'search', request);
  }
}

function validateCreateOrderRequest(request: CreateOrderRequest): void {
  const errors = validateRequired(request as unknown as Record<string, unknown>, ['line_items']);

  if (!request.customerData && !('customerId' in request && request.customerId)) {
    errors.push({
      field: 'customerData/customerId',
      message: 'Either customerData or customerId must be provided',
    });
  }

  throwIfValidationErrors(errors);
}
