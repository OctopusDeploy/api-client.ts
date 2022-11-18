import { NamedResourceV2, NewNamedResourceV2 } from "../namedResourceV2";
import { NewSpaceScopedResourceV2, SpaceScopedResourceV2 } from "../spaceScopedResourceV2";

interface TenantShared {
  tenantTags: string[];
  projectEnvironments: { [projectId: string]: string[] };
}

export interface Tenant
  extends NamedResourceV2,
    TenantShared,
    SpaceScopedResourceV2 {
  description: string | null;
  clonedFromTenantId: string | null;
}

export interface NewTenantResource
  extends NewNamedResourceV2,
    NewSpaceScopedResourceV2,
    TenantShared {
  description?: string;
}

export interface TagTestResult {
  [key: string]: {
    isMatched: boolean;
    reason: string;
    missingTags: string[];
  };
}

export interface MultiTenancyStatusResource {
  enabled: boolean;
}