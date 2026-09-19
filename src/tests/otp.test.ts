import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Otp } from '../resources/otp';
import { HttpClient } from '../http-client';
import { OtpPurposes } from '../types/otp';

describe('Otp', () => {
  let otp: Otp;
  let httpClient: HttpClient;

  beforeEach(() => {
    httpClient = new HttpClient({ apiKey: 'test' });
    otp = new Otp(httpClient);
  });

  it('should call initiate', async () => {
    const postSpy = vi
      .spyOn(httpClient, 'post')
      .mockResolvedValue({ transaction: { id: 'ot_123' } } as any);
    const payload = {
      recipient: '+233123',
      purpose: OtpPurposes.SignIn,
      sender: 'Acme',
      serviceName: 'Acme Bank',
    };
    await otp.initiate(payload);
    expect(postSpy).toHaveBeenCalledWith('/otp/initiate', payload);
  });

  it('should call verify', async () => {
    const postSpy = vi
      .spyOn(httpClient, 'post')
      .mockResolvedValue({ transaction: { id: 'ot_123' } } as any);
    const payload = { transactionId: 'ot_123', recipient: '+233123', token: '123456' };
    await otp.verify(payload);
    expect(postSpy).toHaveBeenCalledWith('/otp/verify', payload);
  });

  it('should call lookup', async () => {
    const postSpy = vi
      .spyOn(httpClient, 'post')
      .mockResolvedValue({ transaction: { id: 'ot_123' } } as any);
    const payload = { transactionId: 'ot_123', debugMode: 0 };
    await otp.lookup(payload);
    expect(postSpy).toHaveBeenCalledWith('/otp/lookup', payload);
  });

  it('should call cancel', async () => {
    const postSpy = vi
      .spyOn(httpClient, 'post')
      .mockResolvedValue({ transaction: { id: 'ot_123' } } as any);
    const payload = { transactionId: 'ot_123', reason: 'user_requested_new_code' };
    await otp.cancel(payload);
    expect(postSpy).toHaveBeenCalledWith('/otp/cancel', payload);
  });
});
