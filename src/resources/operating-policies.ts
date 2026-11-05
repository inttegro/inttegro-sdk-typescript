import { HttpClient } from '../http-client';
import {
  CreateOperatingPolicyRequest,
  LookupOperatingPolicyRequest,
  OperatingPolicy,
  UpdateOperatingPolicyRequest,
} from '../types';

/** Reusable operating-policy template endpoints. */
export class OperatingPolicies {
  constructor(private httpClient: HttpClient) {}

  async create(request: CreateOperatingPolicyRequest): Promise<OperatingPolicy> {
    return this.httpClient.postResource<OperatingPolicy>(
      '/operating_policies/create',
      'operating_policy',
      request
    );
  }

  async lookup(request: LookupOperatingPolicyRequest): Promise<OperatingPolicy> {
    return this.httpClient.postResource<OperatingPolicy>(
      '/operating_policies/lookup',
      'operating_policy',
      request
    );
  }

  async update(request: UpdateOperatingPolicyRequest): Promise<OperatingPolicy> {
    return this.httpClient.postResource<OperatingPolicy>(
      '/operating_policies/update',
      'operating_policy',
      request
    );
  }
}
