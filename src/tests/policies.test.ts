import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { HttpClient } from '../http-client';
import { ChildrenPolicies } from '../resources/children-policies';
import { OperatingPolicies } from '../resources/operating-policies';
import type { ChildrenPolicyBTAgingSpec } from '../types/children-policies';
import type { OperatingPolicyBTAgingSpec } from '../types/operating-policies';

describe('Policy resources', () => {
  let httpClient: HttpClient;

  beforeEach(() => {
    httpClient = new HttpClient({ apiKey: 'test' });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('exposes response aging-spec identifiers as publicId', () => {
    const children: ChildrenPolicyBTAgingSpec = {
      publicId: 'bt_aging_spec_immediate',
      tPlus: '0h',
    };
    const operating: OperatingPolicyBTAgingSpec = {
      publicId: 'bt_aging_spec_168_hourly',
      tPlus: '168h',
    };

    expect(children.publicId).toBe('bt_aging_spec_immediate');
    expect(operating.publicId).toBe('bt_aging_spec_168_hourly');
  });

  it('looks up and pages children policy versions without public selectors', async () => {
    const postSpy = vi
      .spyOn(httpClient, 'post')
      .mockImplementation(
        async (path) =>
          (path === '/children_policies/page'
            ? { page: { versions: [{ id: 'cp_123' }] } }
            : { childrenPolicy: { id: 'cp_123' } }) as never
      );
    const policies = new ChildrenPolicies(httpClient);

    await policies.lookup();
    await policies.lookup({ version: 2 });
    await policies.page({ number: 2, size: 10 });

    expect(postSpy).toHaveBeenCalledWith('/children_policies/lookup', {});
    expect(postSpy).toHaveBeenCalledWith('/children_policies/lookup', { version: 2 });
    expect(postSpy).toHaveBeenCalledWith('/children_policies/page', { number: 2, size: 10 });
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
    await policies.lookup({ operatingPolicyId: 'op_123', version: 2 });
    postSpy.mockResolvedValueOnce({ page: { versions: [{ id: 'op_123' }] } } as never);
    await policies.page({ operatingPolicyId: 'op_123', number: 2, size: 10 });
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
    expect(postSpy).toHaveBeenCalledWith('/operating_policies/lookup', {
      operatingPolicyId: 'op_123',
      version: 2,
    });
    expect(postSpy).toHaveBeenCalledWith('/operating_policies/page', {
      operatingPolicyId: 'op_123',
      number: 2,
      size: 10,
    });
    expect(postSpy).toHaveBeenCalledWith('/operating_policies/update', {
      operatingPolicyId: 'op_123',
      expectedVersion: 1,
      description: 'Updated',
    });
  });

  it('deserializes policy page envelopes and version objects', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: string) => {
        const operating = url.includes('/operating_policies/');
        return jsonResponse({
          page: {
            number: 1,
            size: 1,
            count: 1,
            total: 2,
            has_more: true,
            versions: [policyWire(operating)],
          },
        });
      })
    );

    const children = await new ChildrenPolicies(httpClient).page();
    const operating = await new OperatingPolicies(httpClient).page({
      operatingPolicyId: 'op_123',
    });

    expect(children.hasMore).toBe(true);
    expect(children.versions[0]).toMatchObject({ id: 'cp_123', activeVersion: 2 });
    expect(children.versions[0].createdAt).toEqual(new Date('2026-11-05T10:00:00Z'));
    expect(operating.versions[0]).toMatchObject({
      id: 'op_123',
      childrenPolicyId: 'cp_123',
      childrenPolicyVersion: 2,
    });
  });
});

function policyWire(operating: boolean): Record<string, unknown> {
  return {
    id: operating ? 'op_123' : 'cp_123',
    version: 1,
    active_version: 2,
    name: operating ? 'Retail' : 'Default',
    capabilities: {},
    ...(operating ? { children_policy_id: 'cp_123', children_policy_version: 2 } : {}),
    created_at: '2026-11-05T10:00:00Z',
    updated_at: '2026-11-05T10:00:00Z',
    version_created_at: '2026-11-05T10:00:00Z',
  };
}

function jsonResponse(body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { 'content-type': 'application/json' },
  });
}
