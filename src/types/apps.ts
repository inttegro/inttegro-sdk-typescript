export const AppManagementRoles = { Parent: 'parent', Child: 'child' } as const;
export type AppManagementRole = (typeof AppManagementRoles)[keyof typeof AppManagementRoles];

export const AppCredentialOwners = { Child: 'child', Parent: 'parent' } as const;
export type AppCredentialOwner = (typeof AppCredentialOwners)[keyof typeof AppCredentialOwners];

export const AppRelationshipKinds = { Placement: 'placement' } as const;
export type AppRelationshipKind = (typeof AppRelationshipKinds)[keyof typeof AppRelationshipKinds];

export const AppRelationshipStatuses = {
  Active: 'active',
  Inactive: 'inactive',
  Suspended: 'suspended',
  Revoked: 'revoked',
} as const;
export type AppRelationshipStatus =
  (typeof AppRelationshipStatuses)[keyof typeof AppRelationshipStatuses];

export interface AppRelationshipPolicy {
  childStanding?: string;
  management?: AppManagementRole;
  credentials?: AppCredentialOwner;
}

export interface CreateAppRequest {
  name: string;
  alias?: string;
  description?: string;
  legalEntityType?: string;
  placementParentApplicationId?: string;
  relationshipPolicy?: AppRelationshipPolicy;
}

export interface AppRelationship {
  id: string;
  kind: AppRelationshipKind;
  parent: AppRelationshipParent;
  status: AppRelationshipStatus;
  createdAt: Date;
}

export interface AppRelationshipParent {
  id: string;
  name: string;
  alias?: string;
}

export interface App {
  id: string;
  name: string;
  alias?: string;
  description?: string;
  createdAt: Date;
  updatedAt?: Date;
  archivedAt?: Date;
  capabilities: Record<string, unknown>;
  secretKey?: {
    id: string;
    tokenType: string;
    issuedAt: Date;
    token: string;
  };
  relationship?: AppRelationship;
}

export interface UpdateAppRequest {
  name?: string;
  alias?: string;
  description?: string;
  legalEntityType?: string;
}
