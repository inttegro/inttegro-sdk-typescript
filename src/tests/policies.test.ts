import { beforeEach, describe, expect, it, vi } from 'vitest';
import { HttpClient } from '../http-client';
import { ChildrenPolicies } from '../resources/children-policies';
import { OperatingPolicies } from '../resources/operating-policies';

describe('Policy resources', () => {
  let httpClient: HttpClient;

  beforeEach(() => {
    httpClient = new HttpClient({ apiKey: 'test' });
  });

  it('looks up the authenticated application children policy without selectors', async () => {
    const postSpy = vi
      .spyOn(httpClient, 'post')
      .mockResolvedValue({ childrenPolicy: { id: 'cp_123' } } as never);

    await new ChildrenPolicies(httpClient).lookup();

    expect(postSpy).toHaveBeenCalledWith('/children_policies/lookup', {});
  });

  it('calls every operating policy endpoint with typed request objects', async () => {
    const postSpy = vi
      .spyOn(httpClient, 'post')
      .mockResolvedValue({ operatingPolicy: { id: 'op_123' } } as never);
    const policies = new OperatingPolicies(httpClient);

    await policies.create({
      name: 'Ghana payments',
      capabilities: { payments: { currencies: ['ghs'] } },
    });
    await policies.lookup({ operatingPolicyId: 'op_123' });
    await policies.update({
      operatingPolicyId: 'op_123',
      expectedVersion: 1,
      description: 'Updated',
    });

    expect(postSpy).toHaveBeenCalledWith('/operating_policies/create', {
      name: 'Ghana payments',
      capabilities: { payments: { currencies: ['ghs'] } },
    });
    expect(postSpy).toHaveBeenCalledWith('/operating_policies/lookup', {
      operatingPolicyId: 'op_123',
    });
    expect(postSpy).toHaveBeenCalledWith('/operating_policies/update', {
      operatingPolicyId: 'op_123',
      expectedVersion: 1,
      description: 'Updated',
    });
  });
});
