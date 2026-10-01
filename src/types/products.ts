import type { CustomData } from './custom-data';
import type { Amount } from './money';
import type { CatalogPriceDefinitionParams, CustomerSelectedAmount } from './prices';

export const ProductTypes = {
  Physical: 'physical',
  Digital: 'digital',
  Service: 'service',
  Voucher: 'voucher',
  Custom: 'custom',
  Cause: 'cause',
} as const;
export type ProductType = (typeof ProductTypes)[keyof typeof ProductTypes];

export const ProductShipmentTypes = {
  Delivery: 'delivery',
  Download: 'download',
  Render: 'render',
  Service: 'service',
  Stream: 'stream',
} as const;
export type ProductShipmentType = (typeof ProductShipmentTypes)[keyof typeof ProductShipmentTypes];

export const ProductShipmentInputTypes = {
  Delivery: 'delivery',
  Download: 'download',
  Render: 'render',
  Stream: 'stream',
} as const;
export type ProductShipmentInputType =
  (typeof ProductShipmentInputTypes)[keyof typeof ProductShipmentInputTypes];

interface ProductDefaultUnitPriceBase {
  id: string;
  active: boolean;
  productId?: string | null;
  label?: string | null;
  about?: string | null;
  createdAt: Date;
  updatedAt?: Date | null;
  archivedAt?: Date | null;
}

export type ProductDefaultUnitPrice = ProductDefaultUnitPriceBase &
  (
    | {
        type: 'fixed_amount';
        fixedAmount: Amount;
        /** Deprecated compatibility alias for fixedAmount. */
        nominal: Amount;
        customerSelectedAmount?: never;
      }
    | {
        type: 'customer_selected_amount';
        customerSelectedAmount: CustomerSelectedAmount;
        fixedAmount?: never;
        nominal?: never;
      }
  );

interface ProductPriceSummaryBase {
  id: string;
  active: boolean;
  label?: string | null;
}

export type ProductPriceSummary = ProductPriceSummaryBase &
  (
    | {
        type: 'fixed_amount';
        fixedAmount: Amount;
        /** Deprecated compatibility alias for fixedAmount. */
        nominal: Amount;
        customerSelectedAmount?: never;
      }
    | {
        type: 'customer_selected_amount';
        customerSelectedAmount: CustomerSelectedAmount;
        fixedAmount?: never;
        nominal?: never;
      }
  );

export interface ProductPhysicalDimensions {
  weightUnit?: string;
  weight?: number;
  size?: number;
  volumeUnit?: string;
  volume?: number;
  length?: number;
  height?: number;
  width?: number;
}

export interface ProductDigitalDimensions {
  bytes?: number;
  sizeUnit?: string;
  size?: number;
}

export interface ProductCustomDimensions {
  sizeUnit?: string;
  size?: number;
  details?: ProductDimensionDetails;
}

export type ProductDimensionDetails = Readonly<Record<string, string>>;

export type VariantValues = Readonly<Record<string, string>>;

export type ProductDimensions =
  | { physical: ProductPhysicalDimensions; digital?: never; custom?: never }
  | { physical?: never; digital: ProductDigitalDimensions; custom?: never }
  | { physical?: never; digital?: never; custom: ProductCustomDimensions };

export interface ProductAttribute {
  name: string;
  value: string;
}

export interface ProductShipment {
  type: ProductShipmentType;
  delivery?: ProductDelivery;
  download?: ProductDownload;
  render?: ProductRender;
  service?: ProductService;
  stream?: ProductStream;
}

export type ProductDelivery = Readonly<Record<string, never>>;
export type ProductDownload = Readonly<Record<string, never>>;
export type ProductRender = Readonly<Record<string, never>>;
export type ProductService = Readonly<Record<string, never>>;
export type ProductStream = Readonly<Record<string, never>>;

export interface ProductShipmentInput {
  type: ProductShipmentInputType;
}

export interface ProductMedia {
  heroImage?: string;
  thumbnail?: string;
  webPageUrl?: string;
  brandLogo?: string;
  infographic?: string;
  promoVideo?: string;
  demoVideo?: string;
  gallery?: string[];
  downloads?: string[];
}

export interface CreateProductRequest {
  type: ProductType;
  name: string;
  reference?: string;
  description?: string;
  about?: string;
  taxCode?: string;
  category?: string;
  shipment?: ProductShipmentInput;
  dimensions?: ProductDimensions;
  unitDimension?: string;
  media?: ProductMedia;
  attributes?: ProductAttribute[];
  publish?: boolean;
  customData?: CustomData;
}

export interface LookupProductRequest {
  productId: string;
}

export interface UpdateProductRequest {
  productId: string;
  type?: ProductType;
  name?: string;
  description?: string;
  about?: string;
  taxCode?: string;
  category?: string;
  shipment?: ProductShipmentInput;
  dimensions?: ProductDimensions;
  unitDimension?: string;
  media?: ProductMedia;
  images?: string[];
  attributes?: ProductAttribute[];
  customData?: CustomData;
}

export interface ProductActionRequest {
  productId: string;
}

export type AddProductPriceRequest = CatalogPriceDefinitionParams & {
  productId: string;
  label?: string;
  about?: string;
};

export interface SetDefaultUnitPriceRequest {
  productId: string;
  priceId: string;
}

export interface PageProductsRequest {
  pageNumber?: number;
  pageSize?: number;
}

export interface Product {
  id: string;
  type: ProductType;
  reference?: string | null;
  name: string;
  description?: string | null;
  about?: string | null;
  taxCode?: string | null;
  category?: string | null;
  prices?: ProductPriceSummary[] | null;
  shipment?: ProductShipment | null;
  media?: ProductMedia | null;
  attributes?: ProductAttribute[] | null;
  dimensions?: ProductDimensions | null;
  customData?: CustomData | null;
  active: boolean;
  createdAt: Date;
  updatedAt?: Date | null;
  archivedAt?: Date | null;
  publishedAt?: Date | null;
  unitDim?: string | null;
}

/** Deterministic questions about a product response. */
export const Product = {
  /** Whether the product is archived. */
  isArchived(product: Product): boolean {
    return product.archivedAt != null;
  },

  /** Whether the product is currently published and available. */
  isPublished(product: Product): boolean {
    return product.active && product.archivedAt == null;
  },

  /** Whether the product has a recorded first publication. */
  wasEverPublished(product: Product): boolean {
    return product.publishedAt != null;
  },
} as const;

export interface ProductPage {
  number: number;
  size: number;
  products: Product[];
}
