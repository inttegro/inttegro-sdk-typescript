import { HttpClient } from '../http-client';
import {
  CancelPurchaseIntentRequest,
  CreatePurchaseIntentRequest,
  LookupPurchaseIntentRequest,
  PagePurchaseIntentsRequest,
  PurchaseIntent,
  PurchaseIntentPage,
  UpdatePurchaseIntentRequest,
} from '../types';
import { throwIfValidationErrors, validateRequired } from '../utils/validation';
import type { ValidationError } from '../utils/validation';

export class PurchaseIntents {
  constructor(private httpClient: HttpClient) {}

  async create(request: CreatePurchaseIntentRequest): Promise<PurchaseIntent> {
    const errors = validateRequired(request as unknown as Record<string, unknown>, ['quantity']);
    errors.push(...validatePurchaseIntentResourceSelection(request));
    errors.push(...validatePurchaseIntentPriceSelection(request));
    throwIfValidationErrors(errors);

    return this.httpClient.postResource<PurchaseIntent>(
      '/purchase_intents/create',
      'purchase_intent',
      request
    );
  }

  async update(request: UpdatePurchaseIntentRequest): Promise<PurchaseIntent> {
    const errors = validateRequired(request as unknown as Record<string, unknown>, ['id']);
    throwIfValidationErrors(errors);

    return this.httpClient.postResource<PurchaseIntent>(
      '/purchase_intents/update',
      'purchase_intent',
      request
    );
  }

  async cancel(request: CancelPurchaseIntentRequest): Promise<PurchaseIntent> {
    const errors = validateRequired(request as unknown as Record<string, unknown>, ['id']);
    throwIfValidationErrors(errors);

    return this.httpClient.postResource<PurchaseIntent>(
      '/purchase_intents/cancel',
      'purchase_intent',
      request
    );
  }

  async lookup(request: LookupPurchaseIntentRequest): Promise<PurchaseIntent> {
    const errors = validateRequired(request as unknown as Record<string, unknown>, ['id']);
    throwIfValidationErrors(errors);

    return this.httpClient.postResource<PurchaseIntent>(
      '/purchase_intents/lookup',
      'purchase_intent',
      request
    );
  }

  async page(request: PagePurchaseIntentsRequest): Promise<PurchaseIntentPage> {
    const errors = validateRequired(request as unknown as Record<string, unknown>, [
      'page_number',
      'page_size',
    ]);
    throwIfValidationErrors(errors);

    return this.httpClient.postResource<PurchaseIntentPage>(
      '/purchase_intents/page',
      'page',
      request
    );
  }
}

function validatePurchaseIntentResourceSelection(
  request: CreatePurchaseIntentRequest
): ValidationError[] {
  const values = [request.product, request.productId, request.bundle, request.bundleId].filter(
    Boolean
  );
  if (values.length === 1) return [];

  return [
    {
      field: 'product/productId/bundle/bundleId',
      message: 'Exactly one product or bundle selector must be provided',
    },
  ];
}

function validatePurchaseIntentPriceSelection(
  request: CreatePurchaseIntentRequest
): ValidationError[] {
  const bundleSelected = Boolean(request.bundle || request.bundleId);
  const priceCount = [request.price, request.priceId].filter(Boolean).length;
  if (bundleSelected && priceCount <= 1) return [];
  if (!bundleSelected && priceCount === 1) return [];

  const message = bundleSelected
    ? 'Provide at most one price or priceId for a bundle'
    : 'Exactly one price or priceId must be provided for a product';

  return [
    {
      field: 'price/priceId',
      message,
    },
  ];
}
