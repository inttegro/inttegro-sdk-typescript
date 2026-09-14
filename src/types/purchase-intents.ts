import type { Amount } from './money';
import type { PriceParams } from './prices';
import type {
  ProductAttribute,
  ProductDimensions,
  ProductMedia,
  ProductPriceSummary,
  ProductShipment,
  ProductType,
  VariantValues,
} from './products';

export const PurchaseIntentStatuses = {
  Active: 'active',
  Expired: 'expired',
  Inactive: 'inactive',
  Used: 'used',
} as const;
export type PurchaseIntentStatus =
  (typeof PurchaseIntentStatuses)[keyof typeof PurchaseIntentStatuses];

export interface PurchaseIntentProductSelector {
  id: string;
  variantSetId?: string;
}

export interface PurchaseIntentPriceSelector {
  id?: string;
  nominal?: PriceParams;
  original?: {
    id?: string;
    nominal?: PriceParams;
  };
  originalId?: string;
}

export interface PurchaseIntentOriginalPrice {
  active: boolean;
  id?: string;
  label?: string;
  nominal: Amount;
}

export interface PurchaseIntentPrice {
  active: boolean;
  id?: string;
  label?: string;
  nominal: Amount;
  original?: PurchaseIntentOriginalPrice;
}

export interface PurchaseIntentQuantity {
  min: number;
  max?: number;
}

export interface PurchaseIntentUsage {
  singleUse?: boolean;
  multiUse?: boolean;
  order?: PurchaseIntentUsageOrder;
}

export interface PurchaseIntentUsageOrder {
  createdAt: Date;
  id: string;
}

interface CreatePurchaseIntentBase {
  quantity: PurchaseIntentQuantity;
  usage?: PurchaseIntentUsage;
  expiresAt?: Date;
}

type PurchaseIntentProductSelection =
  | {
      product: PurchaseIntentProductSelector;
      productId?: never;
    }
  | {
      productId: string;
      product?: never;
    };

type PurchaseIntentPriceSelection =
  | {
      price: PurchaseIntentPriceSelector;
      priceId?: never;
    }
  | {
      priceId: string;
      price?: never;
    };

export type CreatePurchaseIntentRequest = CreatePurchaseIntentBase &
  PurchaseIntentProductSelection &
  PurchaseIntentPriceSelection;

export interface UpdatePurchaseIntentRequest {
  id: string;
  quantity?: PurchaseIntentQuantity;
  expiresAt?: Date | null;
  reactivate?: boolean;
}

export interface CancelPurchaseIntentRequest {
  id: string;
}

export interface LookupPurchaseIntentRequest {
  id: string;
}

export interface PagePurchaseIntentsRequest {
  pageNumber: number;
  pageSize: number;
}

export interface PurchaseIntentMerchant {
  appName?: string;
  organizationId?: string;
  organizationName?: string;
}

export interface PurchaseIntentProduct {
  id: string;
  about?: string;
  active: boolean;
  archivedAt?: Date | null;
  attributes?: ProductAttribute[] | null;
  category?: string;
  createdAt: Date;
  customData?: Readonly<Record<string, string>>;
  description?: string;
  dimensions?: ProductDimensions | null;
  media?: ProductMedia | null;
  name: string;
  prices?: ProductPriceSummary[];
  publishedAt?: Date | null;
  reference?: string;
  shipment?: ProductShipment | null;
  taxCode?: string;
  type: ProductType;
  unitDim?: string;
  updatedAt?: Date | null;
  variantSetId?: string;
}

export interface PurchaseIntentVariantAxis {
  key: string;
  label: string;
  position: number;
}

export interface PurchaseIntentVariant {
  active: boolean;
  position?: number;
  price?: PurchaseIntentPrice;
  product?: PurchaseIntentProduct;
  productId: string;
  variantValues: VariantValues;
}

export interface PurchaseIntentVariantSet {
  active: boolean;
  defaultProductId?: string;
  description?: string;
  id: string;
  name: string;
  reference?: string;
  variantAxes: PurchaseIntentVariantAxis[];
  variants: PurchaseIntentVariant[];
}

export interface PurchaseIntent {
  allowVariants: boolean;
  createdAt: Date;
  expiresAt?: Date;
  id: string;
  inactiveAt?: Date;
  merchant?: PurchaseIntentMerchant;
  price?: PurchaseIntentPrice;
  product?: PurchaseIntentProduct;
  quantity: PurchaseIntentQuantity;
  status: PurchaseIntentStatus;
  updatedAt?: Date | null;
  usage: PurchaseIntentUsage;
  variantSet?: PurchaseIntentVariantSet;
}

/** Deterministic questions about a purchase-intent response. */
export const PurchaseIntent = {
  /** Whether the purchase intent is currently active. */
  isActive(intent: PurchaseIntent): boolean {
    return intent.status === PurchaseIntentStatuses.Active;
  },

  /** Whether the purchase intent can create at most one order. */
  isSingleUse(intent: PurchaseIntent): boolean {
    return intent.usage.singleUse === true;
  },

  /** ID of the order that consumed a single-use purchase intent. */
  usedOrderId(intent: PurchaseIntent): string | undefined {
    if (intent.usage.singleUse !== true) return undefined;
    const id = intent.usage.order?.id;
    return id && id.length > 0 ? id : undefined;
  },
} as const;

export interface PurchaseIntentPage {
  number: number;
  size: number;
  purchaseIntents: PurchaseIntent[];
}
