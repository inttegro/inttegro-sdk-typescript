import type { BankAccountConfig, BankAccountOwner } from './bank-accounts';
import type { WalletConfig } from './wallets';
import type { CustomData, CustomDataInput, CustomDataPatch } from './custom-data';

export const FinancialAccountTypes = {
  Wallet: 'wallet',
  BankAccount: 'bank_account',
  DoshAccount: 'dosh_account',
} as const;
export type FinancialAccountType =
  (typeof FinancialAccountTypes)[keyof typeof FinancialAccountTypes];

export interface PullPushConfig {
  enabled?: boolean;
  enabledAt?: Date;
  mandate?: FinancialAccountMandate | null;
}

export interface FinancialAccountMandate {
  id: string;
  createdAt: Date;
  userAgent: string;
  ipAddress: string;
}

export interface FinancialAccountVerificationRequest {
  id?: string;
  mechanism?: string;
  type?: string;
}

export interface FinancialAccountVerification {
  initiatedAt: Date;
  completedAt?: Date | null;
  request: FinancialAccountVerificationRequest;
}

export type DoshAccount = Readonly<Record<string, never>>;

interface FinancialAccountRequestBase {
  label: string;
  reference: string;
  currency: string;
  description?: string;
  pullConfiguration?: PullPushConfig;
  pushConfiguration?: PullPushConfig;
  customData?: CustomDataInput;
}

export interface FinancialAccountWalletRequest extends FinancialAccountRequestBase {
  type: 'wallet';
  owner: BankAccountOwner;
  wallet: WalletConfig;
  bankAccount?: never;
  doshAccount?: never;
}

export type FinancialAccountBankRequest = FinancialAccountRequestBase & {
  type: 'bank_account';
  bankAccount: BankAccountConfig;
  wallet?: never;
  doshAccount?: never;
  owner?: BankAccountOwner;
};

export interface FinancialAccountDoshRequest extends FinancialAccountRequestBase {
  type: 'dosh_account';
  owner: BankAccountOwner;
  doshAccount: DoshAccount;
  wallet?: never;
  bankAccount?: never;
}

export type CreateFinancialAccountRequest =
  | FinancialAccountWalletRequest
  | FinancialAccountBankRequest
  | FinancialAccountDoshRequest;

export interface FinancialAccount {
  id?: string;
  label?: string;
  type?: FinancialAccountType;
  reference?: string;
  currency?: string;
  description?: string;
  /** Stable identifier for recognizing the same underlying account within this application. */
  fingerprint: string;
  pullConfiguration?: PullPushConfig;
  pushConfiguration?: PullPushConfig;
  wallet?: WalletConfig;
  bankAccount?: BankAccountConfig;
  doshAccount?: DoshAccount;
  customData?: CustomData;
  verification?: FinancialAccountVerification;
  owner?: BankAccountOwner;
  disconnectedAt?: Date | null;
  createdAt?: Date;
}

export interface LookupFinancialAccountRequest {
  accountId: string;
}

export interface ArchiveFinancialAccountRequest {
  accountId: string;
}

export interface PageFinancialAccountsRequest {
  pageNumber?: number;
  pageSize?: number;
}

export interface FinancialAccountPage {
  number?: number;
  size?: number;
  accounts?: FinancialAccount[];
}

export interface VerifyFinancialAccountRequest {
  accountId: string;
  token?: string;
}

export type ConnectFinancialAccountRequest = CreateFinancialAccountRequest;

export interface UpdateFinancialAccountRequest {
  accountId: string;
  label?: string;
  description?: string;
  reference?: string;
  customData?: CustomDataPatch;
  owner?: BankAccountOwner;
}

export interface ToggleFinancialAccountRequest {
  accountId: string;
  unsetAsPayoutDestination?: boolean;
}

export interface ReconnectFinancialAccountRequest {
  accountId: string;
}
