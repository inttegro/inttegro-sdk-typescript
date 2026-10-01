import type { Amount, AmountParams } from './money';
import type { Product } from './products';

/** An inline price supplied in a request. */
export interface PriceParams extends AmountParams {}

/** An inline price returned by the API. */
export interface Price extends Amount {}

export const PriceTypes = {
  FixedAmount: 'fixed_amount',
  CustomerSelectedAmount: 'customer_selected_amount',
} as const;
export type PriceType = (typeof PriceTypes)[keyof typeof PriceTypes];

/** A convenient customer choice; suggestions do not restrict valid amounts. */
export interface SuggestedAmountParams {
  id: string;
  value: number;
  recommended?: boolean;
}

/** Selection policy for a customer-selected catalog price. */
export interface CustomerSelectedAmountParams {
  currency: AmountParams['currency'];
  minimum: number;
  maximum?: number;
  suggestedAmounts?: SuggestedAmountParams[];
}

export interface SuggestedAmount {
  id: string;
  value: number;
  recommended?: boolean;
}

export interface CustomerSelectedAmount {
  currency: Amount['currency'];
  minimum: number;
  maximum?: number;
  suggestedAmounts?: SuggestedAmount[];
}

export type CatalogPriceDefinitionParams =
  | {
      type: 'fixed_amount';
      fixedAmount: AmountParams;
      customerSelectedAmount?: never;
    }
  | {
      type: 'customer_selected_amount';
      /** Customer-selected prices must belong to a catalog product. */
      productId: string;
      customerSelectedAmount: CustomerSelectedAmountParams;
      fixedAmount?: never;
    };

/** Parameters for creating a stored catalog price. */
export type CatalogPriceParams = CatalogPriceDefinitionParams & {
  productId?: string;
  label?: string;
  about?: string;
};

export interface LookupPriceRequest {
  priceId: string;
}

export interface UpdatePriceRequest {
  priceId: string;
  productId?: string;
  label?: string;
  about?: string;
}

export interface PriceActionRequest {
  priceId: string;
}

export interface PagePricesRequest {
  pageNumber?: number;
  pageSize?: number;
  productId?: string;
}

interface CatalogPriceBase {
  id: string;
  label?: string | null;
  about?: string | null;
  active: boolean;
  productId?: string;
  product?: Product | null;
  createdAt: Date;
  updatedAt?: Date | null;
  archivedAt?: Date | null;
}

export type CatalogPrice = CatalogPriceBase &
  (
    | {
        type: 'fixed_amount';
        fixedAmount: Amount;
        /** Deprecated compatibility alias for fixedAmount. */
        nominal?: Amount;
        customerSelectedAmount?: never;
      }
    | {
        type: 'customer_selected_amount';
        customerSelectedAmount: CustomerSelectedAmount;
        fixedAmount?: never;
        nominal?: never;
      }
  );

export interface PricePage {
  number?: number;
  size?: number;
  prices?: CatalogPrice[];
}
