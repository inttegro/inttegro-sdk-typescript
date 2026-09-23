import type { Amount } from './money';
import type { CustomData } from './custom-data';

export const PayoutStatuses = {
  Initialized: 'initialized',
  Scheduled: 'scheduled',
  Processing: 'processing',
  Executing: 'executing',
  Succeeded: 'succeeded',
  Invalid: 'invalid',
  Canceled: 'canceled',
} as const;
export type PayoutStatus = (typeof PayoutStatuses)[keyof typeof PayoutStatuses];

export interface PayoutSettingsLookupScheduleAgingSpec {
  abide: string;
  label: string;
  tPlus: string;
}

export interface PayoutSettingsLookupSchedule {
  agingSpec: PayoutSettingsLookupScheduleAgingSpec;
  description: string;
  interval: string;
  name: string;
  scheduleOn: string;
  type: string;
}

export interface PayoutSettingsMutationScheduleSpec {
  abide: string;
  id: string;
  label: string;
  tPlus: string;
}

export interface PayoutSettingsMutationSchedule {
  description: string;
  id: string;
  interval: string;
  name: string;
  scheduleOn: string;
  spec: PayoutSettingsMutationScheduleSpec;
  type: string;
}

export interface PayoutSettingsLookup {
  destinations: PayoutDestinations;
  fxEnabled?: boolean;
  schedule?: PayoutSettingsLookupSchedule;
}

export interface PayoutSettingsMutation {
  destinations?: PayoutDestinations;
  id?: string;
  fxEnabled?: boolean;
  schedule?: PayoutSettingsMutationSchedule;
}

export interface PayoutDestinations {
  /** Financial account that receives Ghana cedi payouts. */
  ghs?: string;
}

export interface SetPayoutDestinationsRequest {
  destinations: PayoutDestinations;
}

export interface SchedulePayoutRequest {
  destinationId: string;
  executeAfter?: Date;
  maxAmount?: number;
  reference: string;
}

export interface LookupPayoutRequest {
  payoutId: string;
}

export interface PagePayoutsRequest {
  pageNumber: number;
  pageSize?: number;
}

export interface PayoutError {
  cause: string;
  message: string;
  occurredAt: Date;
  type: string;
}

/** A sparse view of one balance transaction's contribution to a payout. */
export interface PayoutBalanceTransaction {
  /** The exact portion allocated to this payout. */
  allocatedAmount: Amount;
  /** The balance transaction's original amount before allocations. */
  amount: Amount;
  /** Unique balance transaction identifier. */
  id: string;
}

export interface Payout {
  amount?: Amount;
  balanceTransactions?: PayoutBalanceTransaction[];
  canceledAt?: Date;
  customData?: CustomData;
  destinationId: string;
  error?: PayoutError;
  executeAfter: Date;
  executedBy?: string;
  expectedAt?: Date;
  failedAt?: Date;
  id: string;
  initiatedAt: Date;
  initiatedBy?: string;
  maxAmount: Amount;
  reference?: string;
  scheduleId?: string;
  scheduledAt?: Date;
  scheduledBy?: string;
  sentAt?: Date;
  sourceId?: string;
  status: PayoutStatus;
  succeededAt?: Date;
}

export interface PayoutPage {
  number: number;
  size: number;
  payouts?: Payout[];
}

export interface CancelPayoutRequest {
  payoutId: string;
}
