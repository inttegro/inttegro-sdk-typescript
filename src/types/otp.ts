import type { RequestMeta } from './requests';

export const OtpAlphabetTypes = {
  Numeric: 'numeric',
  Alpha: 'alpha',
  Alphanumeric: 'alphanumeric',
} as const;
export type OTPAlphabetType = (typeof OtpAlphabetTypes)[keyof typeof OtpAlphabetTypes];

export const OtpPurposes = {
  AccountCreation: 'account_creation',
  AccountRecovery: 'account_recovery',
  EmailVerification: 'email_verification',
  FinancialAccountVerification: 'financial_account_verification',
  PasswordReset: 'password_reset',
  PaymentConfirmation: 'payment_confirmation',
  PaymentMethodVerification: 'payment_method_verification',
  PayoutConfirmation: 'payout_confirmation',
  PhoneVerification: 'phone_verification',
  SensitiveAction: 'sensitive_action',
  SignIn: 'sign_in',
  TransactionConfirmation: 'transaction_confirmation',
  Unspecified: 'unspecified',
} as const;
export type OTPPurpose = (typeof OtpPurposes)[keyof typeof OtpPurposes];

export const OtpStatuses = {
  Canceled: 'canceled',
  Expired: 'expired',
  Pending: 'pending',
  PendingDelivery: 'pending_delivery',
  PendingVerification: 'pending_verification',
  Verified: 'verified',
} as const;
export type OTPStatus = (typeof OtpStatuses)[keyof typeof OtpStatuses];

export const OtpTransmissionStatuses = {
  Delivered: 'delivered',
  Failed: 'failed',
  Submitted: 'submitted',
} as const;
export type OTPTransmissionStatus =
  (typeof OtpTransmissionStatuses)[keyof typeof OtpTransmissionStatuses];

export const OtpVerificationVerdicts = { Fail: 'fail', Pass: 'pass' } as const;
export type OTPVerificationVerdict =
  (typeof OtpVerificationVerdicts)[keyof typeof OtpVerificationVerdicts];

export interface InitiateOtpRequest {
  recipient: string;
  sender: string;
  serviceName: string;
  requestMeta?: RequestMeta;
  messageTemplate?: string;
  preferredGateway?: 'twilio' | 'vonage' | 'africas-talking' | 'termii' | string;
  purpose: OTPPurpose;
  tokenAlphabet?: string;
  tokenAlphabetType?: OTPAlphabetType;
  tokenSize?: number;
  validityDurationInMinutes?: number;
}

export interface VerifyOtpRequest {
  transactionId: string;
  recipient: string;
  token: string;
}

export interface LookupOtpRequest {
  transactionId: string;
  debugMode?: 0 | 1;
}

export interface CancelOtpRequest {
  transactionId: string;
  reason: string;
}

export interface OtpTransmission {
  recipient?: string;
  senderId?: string;
  sentVia?: string;
  status?: OTPTransmissionStatus;
  sentAt?: Date;
}

export interface OtpTransaction {
  id?: string;
  status?: OTPStatus;
  fullMessage?: string;
  initiatedAt?: Date;
  expiresAt?: Date;
  canceledAt?: Date | null;
  cancelReason?: string | null;
  transmission?: OtpTransmission | null;
  recipient?: string;
  sender?: string;
  mechanism?: string;
  gateway?: string;
  preferredGateway?: string;
  createdAt?: Date;
  deliveredAt?: Date;
  verifiableUntil?: string;
}

export interface OtpVerificationAttempt {
  id?: string;
  recipient?: string;
  presentedToken?: string;
  attemptedAt?: Date;
  result?: {
    detail?: string | null;
    verdict?: string;
  };
}

export interface OtpVerification {
  transaction: OtpTransaction;
  verificationAttempt: OtpVerificationAttempt;
}
