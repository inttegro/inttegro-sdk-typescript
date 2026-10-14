import type { CustomData } from './custom-data';

export const FileStatuses = {
  Uploading: 'uploading',
  Processing: 'processing',
  Available: 'available',
  Failed: 'failed',
  Deleted: 'deleted',
} as const;
export type FileStatus = (typeof FileStatuses)[keyof typeof FileStatuses];

export const FileDispositions = { Attachment: 'attachment', Inline: 'inline' } as const;
export type FileDisposition = (typeof FileDispositions)[keyof typeof FileDispositions];

export const FileDeliveries = { Stream: 'stream', Redirect: 'redirect' } as const;
export type FileDelivery = (typeof FileDeliveries)[keyof typeof FileDeliveries];

export const FileScanStatuses = {
  Pending: 'pending',
  Passed: 'passed',
  Failed: 'failed',
  Skipped: 'skipped',
} as const;
export type FileScanStatus = (typeof FileScanStatuses)[keyof typeof FileScanStatuses];

export const FileSourceTypes = {
  Direct: 'direct',
  UploadRequest: 'upload_request',
  Service: 'service',
} as const;
export type FileSourceType = (typeof FileSourceTypes)[keyof typeof FileSourceTypes];

export const FileStorageEncodings = { Identity: 'identity', Brotli: 'br' } as const;
export type FileStorageEncoding = (typeof FileStorageEncodings)[keyof typeof FileStorageEncodings];

export const FileLinkStatuses = {
  Active: 'active',
  Revoked: 'revoked',
  Expired: 'expired',
  Disabled: 'disabled',
} as const;
export type FileLinkStatus = (typeof FileLinkStatuses)[keyof typeof FileLinkStatuses];

export const FileLinkKinds = { Public: 'public' } as const;
export type FileLinkKind = (typeof FileLinkKinds)[keyof typeof FileLinkKinds];

export const FileLinkDeliveryModes = {
  Redirect: 'redirect',
  Download: 'download',
  Inline: 'inline',
} as const;
export type FileLinkDeliveryMode =
  (typeof FileLinkDeliveryModes)[keyof typeof FileLinkDeliveryModes];

export const UploadRequestStatuses = {
  Pending: 'pending',
  Uploading: 'uploading',
  Fulfilled: 'fulfilled',
  Expired: 'expired',
  Canceled: 'canceled',
  Failed: 'failed',
} as const;
export type UploadRequestStatus =
  (typeof UploadRequestStatuses)[keyof typeof UploadRequestStatuses];

export const UploadReviewDecisions = { Approved: 'approved', Rejected: 'rejected' } as const;
export type UploadReviewDecision =
  (typeof UploadReviewDecisions)[keyof typeof UploadReviewDecisions];

export const UploadReviewTypes = { Automatic: 'automatic', Manual: 'manual' } as const;
export type UploadReviewType = (typeof UploadReviewTypes)[keyof typeof UploadReviewTypes];

export interface RequestOptions {
  idempotencyKey?: string;
}

export interface FileCreateRequest {
  file: string | Blob;
  filename?: string;
  purpose: string;
  title?: string;
  customData?: CustomData;
}

export interface FileLookupRequest {
  fileId: string;
}

export interface FilePageRequest {
  createdAfter?: Date;
  createdBefore?: Date;
  pageNumber?: number;
  pageSize?: number;
  purpose?: string;
  status?: FileStatus;
}

export interface FileContentsRequest {
  disposition?: FileDisposition;
  fileId: string;
}

export interface FileDeleteRequest {
  fileId: string;
}

export interface FileActor {
  type?: string;
  id?: string;
  name?: string;
  email?: string;
}

export interface FileSource {
  type?: string;
  id?: string;
}

export type FileMetadata = Readonly<Record<string, string>>;

export interface FileLinkAccessRequest {
  maxAccesses?: number;
  allowDownload?: boolean;
  allowedOrigins?: string[];
  allowedIpRanges?: string[];
}

export interface FileLinkAccess {
  maxAccesses?: number;
  accessCount?: number;
  lastAccessedAt?: Date | null;
  allowDownload?: boolean;
  allowedOrigins?: string[];
}

export interface FileLinkDelivery {
  mode?: FileLinkDeliveryMode;
}

export interface FileResource {
  id?: string;
  name?: string;
  type?: string;
}

export interface UploadRequestConstraints {
  minSize?: number;
  maxSize?: number;
  exactSize?: number;
  contentTypes?: string[];
  extensions?: string[];
  filename?: string;
}

export interface UploadRequestDisplay {
  title?: string;
  description?: string;
  helpText?: string;
}

export interface UploadRequestAttempts {
  maxAttempts?: number;
  attemptCount?: number;
  failedAttemptCount?: number;
  lastAttemptedAt?: Date;
}

export interface File {
  id: string;
  purpose: string;
  status: FileStatus;
  scanStatus?: string;
  name?: string | null;
  filename?: string | null;
  contentType?: string;
  size?: number;
  createdAt?: Date;
  updatedAt?: Date | null;
  deletedAt?: Date | null;
  title?: string | null;
  customData?: CustomData;
  createdBy?: FileActor;
  source?: FileSource;
}

export interface FilePage {
  number?: number;
  size?: number;
  files?: File[];
}

export interface FileLinkCreateRequest {
  access?: FileLinkAccessRequest;
  createdBy?: FileActor;
  delivery?: FileLinkDelivery;
  expiresAt?: Date;
  fileId: string;
  customData?: CustomData;
}

export interface FileLinkLookupRequest {
  id: string;
}

export interface FileLinkPageRequest {
  fileId?: string;
  pageNumber?: number;
  pageSize?: number;
  status?: FileLinkStatus;
}

export interface FileLinkRevokeRequest {
  id: string;
  revokedBy?: FileActor;
}

export interface FileLinkOpenRequest {
  url: string;
  saveTo?: string;
}

export interface FileLink {
  id: string;
  fileId: string;
  status: FileLinkStatus;
  expiresAt?: Date | null;
  createdAt?: Date;
  revokedAt?: Date | null;
  customData?: CustomData;
  metadata?: FileMetadata;
  access?: FileLinkAccess;
  delivery?: FileLinkDelivery;
}

export interface FileLinkPage {
  number?: number;
  size?: number;
  fileLinks?: FileLink[];
}

export interface FileLinkCreation {
  fileLink: FileLink;
  url: string;
}

export interface UploadRequestCreateRequest {
  attempts?: Pick<UploadRequestAttempts, 'maxAttempts'>;
  constraints?: UploadRequestConstraints;
  display?: UploadRequestDisplay;
  expiresAt?: Date;
  customData?: CustomData;
  purpose: string;
  recipient?: FileActor;
  requester?: FileActor;
  resource?: FileResource;
  subject?: FileActor;
}

export interface UploadRequestLookupRequest {
  id: string;
}

export interface UploadRequestPageRequest {
  pageNumber?: number;
  pageSize?: number;
  purpose?: string;
  resource?: FileResource;
  status?: UploadRequestStatus;
}

export interface UploadRequestCancelRequest {
  canceledBy?: FileActor;
  id: string;
}

export interface UploadRequestReviewReason {
  code: string;
  message: string;
  param?: string;
}

interface UploadRequestReviewBaseRequest {
  decision: UploadReviewDecision;
  id: string;
  publicMessage?: string;
  reasons?: UploadRequestReviewReason[];
}

export interface UploadRequestReviewByIdRequest extends UploadRequestReviewBaseRequest {
  attemptId: string;
  attemptOrdinal?: never;
}

export interface UploadRequestReviewByOrdinalRequest extends UploadRequestReviewBaseRequest {
  attemptId?: never;
  attemptOrdinal: number;
}

export type UploadRequestReviewRequest =
  UploadRequestReviewByIdRequest | UploadRequestReviewByOrdinalRequest;

export interface UploadRequestFulfillRequest {
  file: string | Blob;
  filename?: string;
  uploadUrl: string;
}

export interface UploadRequest {
  id: string;
  purpose: string;
  status: UploadRequestStatus;
  uploadUrl?: string;
  expiresAt?: Date | null;
  createdAt?: Date;
  canceledAt?: Date | null;
  customData?: CustomData;
  metadata?: FileMetadata;
  constraints?: UploadRequestConstraints;
  display?: UploadRequestDisplay;
  recipient?: FileActor;
  requester?: FileActor;
  resource?: FileResource;
  subject?: FileActor;
  attempts?: UploadRequestAttempts;
}

export interface UploadRequestPage {
  number?: number;
  size?: number;
  uploadRequests?: UploadRequest[];
}

export interface UploadFulfillment {
  uploadRequest: UploadRequest;
  file: File;
}
