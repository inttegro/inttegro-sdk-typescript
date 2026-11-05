export interface OperatingPolicyAmountRange {
  min: number;
  max: number;
}

export interface OperatingPolicyLimits {
  amount: OperatingPolicyAmountRange;
}

export interface OperatingPolicyBTAgingSpec {
  publicId: string;
  tPlus: string;
}

export interface OperatingPolicyBTAgingSpecReference {
  id: string;
}

export interface OperatingPolicyPaymentMethodCapabilities {
  enabled: boolean;
  confirmsUse: boolean;
}

export interface OperatingPolicyPaymentMethodsCapabilities {
  mobileMoney?: OperatingPolicyPaymentMethodCapabilities;
  bankAccount?: OperatingPolicyPaymentMethodCapabilities;
  motito?: OperatingPolicyPaymentMethodCapabilities;
  card?: OperatingPolicyPaymentMethodCapabilities;
}

export interface OperatingPolicyPaymentsCapabilities {
  currencies?: string[];
  limits?: OperatingPolicyLimits;
}

export interface OperatingPolicyPayoutsCapabilities {
  enabled?: boolean;
  limits?: OperatingPolicyLimits;
  btAgingSpec?: OperatingPolicyBTAgingSpec;
}

export interface OperatingPolicyCapabilities {
  payments?: OperatingPolicyPaymentsCapabilities;
  payouts?: OperatingPolicyPayoutsCapabilities;
  paymentMethods?: OperatingPolicyPaymentMethodsCapabilities;
}

export interface OperatingPolicyPayoutsSelection {
  enabled?: boolean;
  limits?: OperatingPolicyLimits;
  btAgingSpec?: OperatingPolicyBTAgingSpecReference;
}

export interface OperatingPolicyCapabilitiesSelection {
  payments?: OperatingPolicyPaymentsCapabilities;
  payouts?: OperatingPolicyPayoutsSelection;
  paymentMethods?: OperatingPolicyPaymentMethodsCapabilities;
}

export type OperatingPolicySelection =
  | { id: string; capabilities?: never }
  | { id?: never; capabilities: OperatingPolicyCapabilitiesSelection };

export const OperatingPolicySourceTypes = {
  Inline: 'inline',
  Template: 'template',
} as const;
export type OperatingPolicySourceType =
  (typeof OperatingPolicySourceTypes)[keyof typeof OperatingPolicySourceTypes];

export interface OperatingPolicySource {
  type: OperatingPolicySourceType;
  id?: string;
  version?: number;
}

export interface ApplicationOperatingPolicy {
  capabilities: OperatingPolicyCapabilities;
  source: OperatingPolicySource;
}

export interface OperatingPolicy {
  id: string;
  version: number;
  activeVersion: number;
  name: string;
  description?: string;
  capabilities: OperatingPolicyCapabilities;
  childrenPolicyId: string;
  childrenPolicyVersion: number;
  createdAt: Date;
  updatedAt: Date;
  versionCreatedAt: Date;
}

export interface CreateOperatingPolicyRequest {
  name: string;
  description?: string;
  capabilities: OperatingPolicyCapabilitiesSelection;
}

export interface LookupOperatingPolicyRequest {
  operatingPolicyId: string;
}

export interface UpdateOperatingPolicyRequest {
  operatingPolicyId: string;
  expectedVersion: number;
  name?: string;
  description?: string;
  capabilities?: OperatingPolicyCapabilitiesSelection;
}
