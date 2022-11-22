import { NamedResourceV2, NewNamedResourceV2 } from "../namedResourceV2";
import { NewSpaceScopedResourceV2, SpaceScopedResourceV2 } from "../spaceScopedResourceV2";

export interface Tenant extends NamedResourceV2, SpaceScopedResourceV2 {
    Description: string | null;
    ClonedFromTenantId: string | null;
    TenantTags: string[];
    ProjectEnvironments: { [projectId: string]: string[] };
}

export interface NewTenant extends NewNamedResourceV2, NewSpaceScopedResourceV2 {
    Description?: string;
    ClonedFromTenantId?: string;
    TenantTags?: string[];
    ProjectEnvironments?: { [projectId: string]: string[] };
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
