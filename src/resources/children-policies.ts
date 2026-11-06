import { HttpClient } from '../http-client';
import {
  ChildrenPolicy,
  ChildrenPolicyVersionsPage,
  LookupChildrenPolicyRequest,
  PageChildrenPolicyVersionsRequest,
} from '../types';
import { throwIfValidationErrors } from '../utils/validation';
import type { ValidationError } from '../utils/validation';

/** Gated children-policy lookup endpoints. */
export class ChildrenPolicies {
  constructor(private httpClient: HttpClient) {}

  /** Returns the latest policy by default, or one exact immutable version. */
  async lookup(request: LookupChildrenPolicyRequest = {}): Promise<ChildrenPolicy> {
    throwIfValidationErrors(validateVersion(request.version));
    return this.httpClient.postResource<ChildrenPolicy>(
      '/children_policies/lookup',
      'children_policy',
      request
    );
  }

  /** Lists immutable versions of the authenticated application's children policy. */
  async page(request: PageChildrenPolicyVersionsRequest = {}): Promise<ChildrenPolicyVersionsPage> {
    return this.httpClient.postResource<ChildrenPolicyVersionsPage>(
      '/children_policies/page',
      'page',
      request
    );
  }
}

function validateVersion(version: number | undefined): ValidationError[] {
  if (version === undefined || (Number.isInteger(version) && version >= 1)) return [];
  return [
    { field: 'version', message: "Field 'version' must be an integer greater than or equal to 1" },
  ];
}
