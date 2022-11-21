import { NamedResourceV2, NewNamedResourceV2 } from "../namedResourceV2";
import { NewSpaceScopedResourceV2, SpaceScopedResourceV2 } from "../spaceScopedResourceV2";

interface TenantShared {
    TenantTags: string[];
    ProjectEnvironments: { [projectId: string]: string[] };
}

export interface Tenant extends NamedResourceV2, TenantShared, SpaceScopedResourceV2 {
    Description: string | null;
    ClonedFromTenantId: string | null;
}

export interface NewTenantResource extends NewNamedResourceV2, NewSpaceScopedResourceV2, TenantShared {
    Description?: string;
}

export interface TagTestResult {
    [key: string]: {
        IsMatched: boolean;
        Reason: string;
        MissingTags: string[];
    };
}

export interface MultiTenancyStatusResource {
    Enabled: boolean;
}
