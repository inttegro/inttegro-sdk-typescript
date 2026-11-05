/**
 * Main Inttegro SDK client
 */

import { InttegroConfig, RequestInterceptor, ResponseInterceptor } from './config';
import { HttpClient, InttegroResponse } from './http-client';
import { Chimes } from './resources/chimes';
import { Balances } from './resources/balances';
import { FinancialAccounts } from './resources/financial-accounts';
import { Files } from './resources/files';
import { FileLinks } from './resources/file-links';
import { Customers } from './resources/customers';
import { Products } from './resources/products';
import { Prices } from './resources/prices';
import { Otp } from './resources/otp';
import { Orders } from './resources/orders';
import { PaymentMethods } from './resources/payment-methods';
import { Payouts } from './resources/payouts';
import { BalanceTransactions } from './resources/balance-transactions';
import { Spec } from './resources/spec';
import { Schedules } from './resources/schedules';
import { Broadcasts } from './resources/broadcasts';
import { MessageTemplates } from './resources/message-templates';
import { UploadRequests } from './resources/upload-requests';
import { Apps } from './resources/apps';
import { ChildrenPolicies } from './resources/children-policies';
import { Keys } from './resources/keys';
import { PurchaseIntents } from './resources/purchase-intents';
import { FileReferences } from './resources/file-references';
import { Refunds } from './resources/refunds';
import { OperatingPolicies } from './resources/operating-policies';

/**
 * Main Inttegro SDK client
 *
 * @example
 * ```typescript
 * import { InttegroClient } from '@inttegro/inttegro-sdk';
 *
 * const inttegro = new InttegroClient({
 *   apiKey: 'your-api-key',
 *   baseUrl: 'https://api.inttegro.com', // optional
 *   timeout: 30000, // optional
 *   debug: false, // optional
 * });
 *
 * // Use the orders resource
 * const order = await inttegro.orders.create({ ... });
 * ```
 */
export class InttegroClient {
  private httpClient: HttpClient;

  /** Orders resource for managing orders */
  public readonly orders: Orders;
  /** OTP resource */
  public readonly otp: Otp;
  /** Chimes resource */
  public readonly chimes: Chimes;
  /** Schedules resource */
  public readonly schedules: Schedules;
  /** Broadcasts resource */
  public readonly broadcasts: Broadcasts;
  /** Message templates resource */
  public readonly messageTemplates: MessageTemplates;
  /** Financial accounts resource */
  public readonly financialAccounts: FinancialAccounts;
  /** Files resource */
  public readonly files: Files;
  /** File links resource */
  public readonly fileLinks: FileLinks;
  /** Customers resource */
  public readonly customers: Customers;
  /** Products resource */
  public readonly products: Products;
  /** Prices resource */
  public readonly prices: Prices;
  /** Apps resource for managing the authenticated application */
  public readonly apps: Apps;
  /** Gated children-policy lookup resource */
  public readonly childrenPolicies: ChildrenPolicies;
  /** Reusable operating-policy templates */
  public readonly operatingPolicies: OperatingPolicies;
  /** Payment methods resource */
  public readonly paymentMethods: PaymentMethods;
  /** Payouts resource */
  public readonly payouts: Payouts;
  /** Balance transactions resource */
  public readonly balanceTransactions: BalanceTransactions;
  /** Balances resource */
  public readonly balances: Balances;
  /** Specifications resource */
  public readonly spec: Spec;
  /** Upload requests resource */
  public readonly uploadRequests: UploadRequests;
  /** Secret keys resource */
  public readonly keys: Keys;
  /** Purchase intents resource */
  public readonly purchaseIntents: PurchaseIntents;
  /** File references resource */
  public readonly fileReferences: FileReferences;
  /** Refunds resource */
  public readonly refunds: Refunds;

  /**
   * Create a new Inttegro SDK client
   *
   * @param config - Configuration options
   * @throws {Error} If API key is not provided
   */
  constructor(config: InttegroConfig) {
    if (!config.apiKey) {
      throw new Error('API key is required. Please provide an apiKey in the config.');
    }

    this.httpClient = new HttpClient(config);
    this.orders = new Orders(this.httpClient);
    this.otp = new Otp(this.httpClient);
    this.chimes = new Chimes(this.httpClient);
    this.schedules = new Schedules(this.httpClient);
    this.broadcasts = new Broadcasts(this.httpClient);
    this.messageTemplates = new MessageTemplates(this.httpClient);
    this.financialAccounts = new FinancialAccounts(this.httpClient);
    this.files = new Files(this.httpClient);
    this.fileLinks = new FileLinks(this.httpClient);
    this.customers = new Customers(this.httpClient);
    this.products = new Products(this.httpClient);
    this.prices = new Prices(this.httpClient);
    this.apps = new Apps(this.httpClient);
    this.childrenPolicies = new ChildrenPolicies(this.httpClient);
    this.operatingPolicies = new OperatingPolicies(this.httpClient);
    this.paymentMethods = new PaymentMethods(this.httpClient);
    this.payouts = new Payouts(this.httpClient);
    this.balanceTransactions = new BalanceTransactions(this.httpClient);
    this.balances = new Balances(this.httpClient);
    this.spec = new Spec(this.httpClient);
    this.uploadRequests = new UploadRequests(this.httpClient);
    this.keys = new Keys(this.httpClient);
    this.purchaseIntents = new PurchaseIntents(this.httpClient);
    this.fileReferences = new FileReferences(this.httpClient);
    this.refunds = new Refunds(this.httpClient);
  }

  /**
   * Update SDK configuration
   *
   * @param config - Partial configuration to update
   *
   * @example
   * ```typescript
   * inttegro.updateConfig({
   *   timeout: 60000,
   *   debug: true,
   * });
   * ```
   */
  updateConfig(config: Partial<InttegroConfig>): void {
    this.httpClient.updateConfig(config);
  }

  /**
   * Add a request interceptor
   *
   * Request interceptors allow you to modify requests before they are sent.
   *
   * @param interceptor - Request interceptor function
   *
   * @example
   * ```typescript
   * inttegro.addRequestInterceptor(async (url, options) => {
   *   // Add custom header
   *   options.headers = {
   *     ...options.headers,
   *     'X-Custom-Header': 'value',
   *   };
   *   return { url, options };
   * });
   * ```
   */
  addRequestInterceptor(interceptor: RequestInterceptor): void {
    this.httpClient.addRequestInterceptor(interceptor);
  }

  /**
   * Add a response interceptor
   *
   * Response interceptors allow you to process responses before they are returned.
   *
   * @param interceptor - Response interceptor function
   *
   * @example
   * ```typescript
   * inttegro.addResponseInterceptor(async (response) => {
   *   // Log response status
   *   console.log('Response status:', response.status);
   *   return response;
   * });
   * ```
   */
  addResponseInterceptor(interceptor: ResponseInterceptor): void {
    this.httpClient.addResponseInterceptor(interceptor);
  }

  /**
   * Make a JSON request and keep native HTTP response facts with the decoded body.
   *
   * Prefer typed resource methods such as `orders.createWithResponse` when they
   * exist. This lower-level helper is useful while response-envelope coverage is
   * rolled out across every resource.
   */
  requestWithResponse<T>(path: string, options: RequestInit = {}): Promise<InttegroResponse<T>> {
    return this.httpClient.requestWithResponse<T>(path, options);
  }

  /**
   * Make a POST request and keep native HTTP response facts with the decoded body.
   */
  postWithResponse<T>(
    path: string,
    body?: unknown,
    options: RequestInit = {}
  ): Promise<InttegroResponse<T>> {
    return this.httpClient.postWithResponse<T>(path, body, options);
  }
}
