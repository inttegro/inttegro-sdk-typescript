import { describe, expect, it } from 'vitest';
import type { ChildrenPolicyBTAgingSpec } from '../types/children-policies';
import type { OperatingPolicyBTAgingSpec } from '../types/operating-policies';

describe('policy wire names', () => {
  it('exposes response aging-spec identifiers as id', () => {
    const children: ChildrenPolicyBTAgingSpec = {
      id: 'bt_aging_spec_immediate',
      tPlus: '0h',
    };
    const operating: OperatingPolicyBTAgingSpec = {
      id: 'bt_aging_spec_168_hourly',
      tPlus: '168h',
    };

    expect(children.id).toBe('bt_aging_spec_immediate');
    expect(operating.id).toBe('bt_aging_spec_168_hourly');
  });
});
