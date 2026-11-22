import type { CustomData, JSONData } from './custom-data';
import type {
  MessageHeaders,
  MessageTemplateReference,
  MessageTemplateSafetyResult,
} from './message-templates';
import type { RequestMeta } from './requests';

export const ChimeTransports = { Sms: 'sms', Email: 'email' } as const;
export type ChimeTransport = (typeof ChimeTransports)[keyof typeof ChimeTransports];

export const ChimeRecipientTypes = { Phone: 'phone', Email: 'email' } as const;
export type ChimeRecipientType = (typeof ChimeRecipientTypes)[keyof typeof ChimeRecipientTypes];

export const ChimeEmailSchemaKinds = {
  GmailViewAction: 'gmail_view_action',
  SchemaOrgOrder: 'schema_org_order',
  SchemaOrgInvoice: 'schema_org_invoice',
} as const;
export type ChimeEmailSchemaKind =
  (typeof ChimeEmailSchemaKinds)[keyof typeof ChimeEmailSchemaKinds];

export type ChimeRecipientTransport = 'sms' | 'email';

export interface ChimeRecipientPhone {
  number: string;
}

export interface ChimeRecipientEmail {
  address: string;
}

export type ChimeRecipient =
  | {
      type: 'phone';
      name?: string;
      phone: ChimeRecipientPhone;
      email?: never;
      customerId?: never;
      transport?: never;
    }
  | {
      type: 'email';
      name?: string;
      email: ChimeRecipientEmail;
      phone?: never;
      customerId?: never;
      transport?: never;
    }
  | {
      customerId: string;
      transport: ChimeRecipientTransport;
      type?: never;
      name?: never;
      phone?: never;
      email?: never;
    };

export interface ChimeEmailAddress {
  address: string;
  name?: string;
}

export interface ChimeEmailMessageInput {
  subject: string;
  text: string;
  html?: string;
  from: ChimeEmailAddress;
  replyTo?: string;
  headers?: MessageHeaders;
}

export interface ChimeEmailMessage {
  subject?: string;
  text?: string;
  html?: string | null;
  from?: ChimeEmailAddress;
  replyTo?: ChimeEmailAddress;
  headers?: MessageHeaders;
  safety?: MessageTemplateSafetyResult;
  schema?: JSONData;
}

interface SendChimeRequestBase {
  recipient: ChimeRecipient;
  senderId?: string;
  purpose?: string;
  customData?: CustomData;
  requestMeta?: RequestMeta;
}

export type SendChimeRequest =
  | (SendChimeRequestBase & {
      fullMessage: string;
      email?: never;
      messageTemplate?: never;
    })
  | (SendChimeRequestBase & {
      fullMessage?: never;
      email: ChimeEmailMessageInput;
      messageTemplate?: never;
    })
  | (SendChimeRequestBase & {
      fullMessage?: never;
      email?: never;
      messageTemplate: MessageTemplateReference;
    });

interface ScheduleChimeRequestBase {
  recipients: ChimeRecipient[];
  sendAfter: Date;
  senderId?: string;
  purpose?: string | null;
  requestMeta?: RequestMeta;
}

export type ScheduleChimeRequest =
  | (ScheduleChimeRequestBase & {
      fullMessage: string;
      email?: never;
      messageTemplate?: never;
    })
  | (ScheduleChimeRequestBase & {
      fullMessage?: never;
      email: ChimeEmailMessageInput;
      messageTemplate?: never;
    })
  | (ScheduleChimeRequestBase & {
      fullMessage?: never;
      email?: never;
      messageTemplate: MessageTemplateReference;
    });

export interface LookupChimeRequest {
  chimeId: string;
}

export interface ChimeTransmission {
  address: string;
  createdAt: Date;
  deliveredAt?: Date | null;
  failedAt?: Date | null;
  initializedAt: Date;
  mechanism: ChimeTransport;
  sentAt?: Date | null;
  sentVia?: ChimeTransport | null;
  status: string;
  suppressedAt?: Date | null;
}

export interface Chime {
  id?: string;
  createdAt?: Date;
  fullMessage?: string;
  email?: ChimeEmailMessage;
  recipient?: ChimeRecipient;
  senderId?: string;
  purpose?: string | null;
  customData?: CustomData;
  transmission?: ChimeTransmission | null;
}

export type BroadcastChimeMessageTemplate = string | MessageTemplateReference;

export interface BroadcastChimeRequest {
  messageTemplate?: BroadcastChimeMessageTemplate;
  email?: ChimeEmailMessageInput;
  purpose?: string;
  recipients: ChimeRecipient[];
  sender?: string;
  requestMeta?: RequestMeta;
}

export interface PageChimesRequest {
  customerId?: string;
  pageNumber?: number;
  pageSize?: number;
  recipient?: string;
}

export interface ChimePage {
  number?: number;
  size?: number;
  chimes?: Chime[];
}

export interface LookupBroadcastRequest {
  broadcastId: string;
}

export interface CancelBroadcastRequest {
  broadcastId: string;
}

export interface BroadcastError {
  recipient?: string;
  fixCode?: string;
  type?: string;
}

export interface Broadcast {
  id?: string;
  recipients?: string[];
  content?: string;
  senderId?: string;
  purpose?: string | null;
  sendAfter?: Date;
  createdAt?: Date;
  executedAt?: Date | null;
  canceledAt?: Date | null;
  errors?: BroadcastError[];
  chimeIds?: string[];
  customerIds?: string[];
  email?: ChimeEmailMessage;
}

export interface LookupScheduleRequest {
  scheduleId: string;
}

export interface CancelScheduleRequest {
  scheduleId: string;
}

export interface ScheduleError {
  recipient?: string;
  fixCode?: string;
  type?: string;
}

export interface ScheduledChime {
  id?: string;
  recipients?: string[];
  content?: string;
  senderId?: string;
  purpose?: string | null;
  sendAfter?: Date;
  createdAt?: Date;
  executedAt?: Date | null;
  canceledAt?: Date | null;
  errors?: ScheduleError[];
  chimeIds?: string[];
  fullMessage?: string;
}
