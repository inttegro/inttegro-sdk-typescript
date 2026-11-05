export interface ChildrenPolicyAmountRange {
  min: number;
  max: number;
}

export interface ChildrenPolicyLimits {
  amount: ChildrenPolicyAmountRange;
}

export interface ChildrenPolicyBTAgingSpec {
  publicId: string;
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
  ownerApplicationId: string;
  version: number;
  activeVersion: number;
  name: string;
  description?: string;
  capabilities: ChildrenPolicyCapabilities;
  createdAt: Date;
  updatedAt: Date;
  versionCreatedAt: Date;
}
