export interface ChildrenPolicyAmountRange {
  min: number;
  max: number;
}

export interface ChildrenPolicyLimits {
  amount: ChildrenPolicyAmountRange;
}

export interface ChildrenPolicyBTAgingSpec {
  id: string;
  tPlus: string;
}

export interface ChildrenPolicyPaymentMethodCapabilities {
  enabled: boolean[];
  confirmsUse: boolean[];
}

export interface ChildrenPolicyPaymentMethodsCapabilities {
  mobileMoney?: ChildrenPolicyPaymentMethodCapabilities;
  bankAccount?: ChildrenPolicyPaymentMethodCapabilities;
  motito?: ChildrenPolicyPaymentMethodCapabilities;
  card?: ChildrenPolicyPaymentMethodCapabilities;
}

export interface ChildrenPolicyPaymentsCapabilities {
  currencies?: string[];
  limits?: ChildrenPolicyLimits;
}

export interface ChildrenPolicyPayoutsCapabilities {
  enabled?: boolean[];
  limits?: ChildrenPolicyLimits;
  btAgingSpec?: ChildrenPolicyBTAgingSpec[];
}

export interface ChildrenPolicyCapabilities {
  payments?: ChildrenPolicyPaymentsCapabilities;
  payouts?: ChildrenPolicyPayoutsCapabilities;
  paymentMethods?: ChildrenPolicyPaymentMethodsCapabilities;
}

export interface ChildrenPolicy {
  id: string;
  version: number;
  activeVersion: number;
  name: string;
  description?: string;
  capabilities: ChildrenPolicyCapabilities;
  createdAt: Date;
  updatedAt: Date;
  versionCreatedAt: Date;
}

/** Selects the latest children policy by default, or one exact immutable version. */
export interface LookupChildrenPolicyRequest {
  version?: number;
}

/** Controls pagination through the authenticated application's policy versions. */
export interface PageChildrenPolicyVersionsRequest {
  number?: number;
  size?: number;
}

/** One page of immutable children-policy versions, ordered newest first. */
export interface ChildrenPolicyVersionsPage {
  number: number;
  size: number;
  count: number;
  total: number;
  hasMore: boolean;
  versions: ChildrenPolicy[];
}
