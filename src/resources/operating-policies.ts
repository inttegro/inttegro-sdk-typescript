import { HttpClient } from '../http-client';
import {
  CreateOperatingPolicyRequest,
  LookupOperatingPolicyRequest,
  OperatingPolicy,
  OperatingPolicyVersionsPage,
  PageOperatingPolicyVersionsRequest,
  UpdateOperatingPolicyRequest,
} from '../types';
import { throwIfValidationErrors, validateRequired } from '../utils/validation';
import type { ValidationError } from '../utils/validation';

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
    throwIfValidationErrors(validateLookup(request));
    return this.httpClient.postResource<OperatingPolicy>(
      '/operating_policies/lookup',
      'operating_policy',
      request
    );
  }

  /** Lists immutable versions of one operating policy. */
  async page(request: PageOperatingPolicyVersionsRequest): Promise<OperatingPolicyVersionsPage> {
    throwIfValidationErrors(
      validateRequired(request as unknown as Record<string, unknown>, ['operating_policy_id'])
    );
    return this.httpClient.postResource<OperatingPolicyVersionsPage>(
      '/operating_policies/page',
      'page',
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

function validateLookup(request: LookupOperatingPolicyRequest): ValidationError[] {
  const errors = validateRequired(request as unknown as Record<string, unknown>, [
    'operating_policy_id',
  ]);
  if (
    request.version !== undefined &&
    (!Number.isInteger(request.version) || request.version < 1)
  ) {
    errors.push({
      field: 'version',
      message: "Field 'version' must be an integer greater than or equal to 1",
    });
  }
  return errors;
}
