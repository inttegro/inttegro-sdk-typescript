import { HttpClient } from '../http-client';
import { ChildrenPolicy } from '../types';

/** Gated children-policy lookup endpoints. */
export class ChildrenPolicies {
  constructor(private httpClient: HttpClient) {}

  async lookup(): Promise<ChildrenPolicy> {
    return this.httpClient.postResource<ChildrenPolicy>(
      '/children_policies/lookup',
      'children_policy',
      {}
    );
  }
}
