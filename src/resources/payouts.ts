import { HttpClient } from '../http-client';
import {
  CancelPayoutRequest,
  LookupPayoutRequest,
  PagePayoutsRequest,
  Payout,
  PayoutPage,
  PayoutSettingsLookup,
  PayoutSettingsMutation,
  ResourceSearchPage,
  ResourceSearchRequest,
  SchedulePayoutRequest,
  SetPayoutDestinationsRequest,
} from '../types';
import { throwIfValidationErrors, validateRequired } from '../utils/validation';

export class Payouts {
  constructor(private httpClient: HttpClient) {}

  async setDestinations(request: SetPayoutDestinationsRequest): Promise<PayoutSettingsMutation> {
    const errors = validateRequired(request as unknown as Record<string, unknown>, [
      'destinations',
    ]);
    throwIfValidationErrors(errors);

    return this.httpClient.postResource<PayoutSettingsMutation>(
      '/payouts/set_destinations',
      'settings',
      request
    );
  }

  async settings(): Promise<PayoutSettingsLookup> {
    return this.httpClient.postResource<PayoutSettingsLookup>('/payouts/settings', 'settings', {});
  }

  async disableAutomatic(): Promise<PayoutSettingsMutation> {
    return this.httpClient.postResource<PayoutSettingsMutation>('/payouts/disable', 'settings', {});
  }

  async enableAutomatic(): Promise<PayoutSettingsMutation> {
    return this.httpClient.postResource<PayoutSettingsMutation>('/payouts/enable', 'settings', {});
  }

  async enableFX(): Promise<PayoutSettingsMutation> {
    return this.httpClient.postResource<PayoutSettingsMutation>(
      '/payouts/enable_fx',
      'settings',
      {}
    );
  }

  async disableFX(): Promise<PayoutSettingsMutation> {
    return this.httpClient.postResource<PayoutSettingsMutation>(
      '/payouts/disable_fx',
      'settings',
      {}
    );
  }

  async page(request: PagePayoutsRequest): Promise<PayoutPage> {
    const errors = validateRequired(request as unknown as Record<string, unknown>, ['pageNumber']);
    throwIfValidationErrors(errors);
    return this.httpClient.postResource<PayoutPage>('/payouts/page', 'page', request);
  }

  async search(request: ResourceSearchRequest): Promise<ResourceSearchPage> {
    return this.httpClient.postResource<ResourceSearchPage>('/payouts/search', 'search', request);
  }

  async schedule(request: SchedulePayoutRequest): Promise<Payout> {
    const errors = validateRequired(request as unknown as Record<string, unknown>, [
      'destinationId',
      'reference',
    ]);
    throwIfValidationErrors(errors);

    return this.httpClient.postResource<Payout>('/payouts/schedule', 'payout', request);
  }

  async lookup(request: LookupPayoutRequest): Promise<Payout> {
    const errors = validateRequired(request as unknown as Record<string, unknown>, ['payoutId']);
    throwIfValidationErrors(errors);

    return this.httpClient.postResource<Payout>('/payouts/lookup', 'payout', request);
  }

  async cancel(request: CancelPayoutRequest): Promise<Payout> {
    const errors = validateRequired(request as unknown as Record<string, unknown>, ['payoutId']);
    throwIfValidationErrors(errors);
    return this.httpClient.postResource<Payout>('/payouts/cancel', 'payout', request);
  }
}
