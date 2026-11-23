import { HttpClient } from '../http-client';
import {
  Broadcast,
  BroadcastChimeRequest,
  Chime,
  ChimePage,
  ChimeSettings,
  LookupChimeRequest,
  PageChimesRequest,
  SendChimeRequest,
  ScheduleChimeRequest,
  ScheduledChime,
} from '../types';
import { throwIfValidationErrors, validateRequired } from '../utils/validation';
import type { ValidationError } from '../utils/validation';

/**
 * Chimes resource for sending and looking up chimes
 */
export class Chimes {
  constructor(private httpClient: HttpClient) {}

  async send(request: SendChimeRequest): Promise<Chime> {
    const errors = validateRequired(request as unknown as Record<string, unknown>, ['recipient']);
    errors.push(...validateExclusiveChimeContent(request, 'fullMessage'));
    throwIfValidationErrors(errors);

    return this.httpClient.postResource<Chime>('/chimes/send', 'chime', request);
  }

  async lookup(request: LookupChimeRequest): Promise<Chime> {
    const errors = validateRequired(request as unknown as Record<string, unknown>, ['chime_id']);
    throwIfValidationErrors(errors);

    return this.httpClient.postResource<Chime>('/chimes/lookup', 'chime', request);
  }

  async page(request: PageChimesRequest = {}): Promise<ChimePage> {
    return this.httpClient.postResource<ChimePage>('/chimes/page', 'page', request);
  }

  async settings(): Promise<ChimeSettings> {
    return this.httpClient.postResource<ChimeSettings>('/chimes/settings', 'settings', {});
  }

  async broadcast(request: BroadcastChimeRequest): Promise<Broadcast> {
    const errors = validateRequired(request as unknown as Record<string, unknown>, [
      'recipients',
      'sender',
    ]);
    if (!request.recipients || request.recipients.length === 0) {
      errors.push({ field: 'recipients', message: 'recipients is required' });
    }
    throwIfValidationErrors(errors);

    return this.httpClient.postResource<Broadcast>('/chimes/broadcast', 'broadcast', request);
  }

  async schedule(request: ScheduleChimeRequest): Promise<ScheduledChime> {
    const errors = validateRequired(request as unknown as Record<string, unknown>, ['send_after']);
    if (!request.recipients || request.recipients.length === 0) {
      errors.push({ field: 'recipients', message: 'recipients is required' });
    }
    errors.push(...validateExclusiveChimeContent(request, 'fullMessage'));
    throwIfValidationErrors(errors);

    return this.httpClient.postResource<ScheduledChime>(
      '/chimes/schedule',
      'scheduled_chime',
      request
    );
  }
}

function validateExclusiveChimeContent(
  request: { fullMessage?: string; email?: unknown },
  smsField: 'fullMessage'
): ValidationError[] {
  const smsContent = request[smsField];
  const hasSMSContent = typeof smsContent === 'string' && smsContent.trim().length > 0;
  const hasEmailContent = request.email !== undefined && request.email !== null;

  if (hasSMSContent && hasEmailContent) {
    return [
      {
        field: 'content',
        message: `${smsField} and email cannot be provided together`,
      },
    ];
  }

  if (!hasSMSContent && !hasEmailContent) {
    return [
      {
        field: 'content',
        message: `Provide either ${smsField} for SMS or email for email delivery`,
      },
    ];
  }

  return [];
}
