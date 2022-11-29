import { NamedResource, NewNamedResource } from "../namedResource";
import { NewSpaceScopedResource, SpaceScopedResource } from "../spaceScopedResource";

export interface Tenant extends SpaceScopedResource, NamedResource {
    Description: string | null;
    ClonedFromTenantId: string | null;
    TenantTags: string[];
    ProjectEnvironments: { [projectId: string]: string[] };
}

export interface NewTenant extends NewSpaceScopedResource, NewNamedResource {
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

export interface MultiTenancyStatus {
    Enabled: boolean;
}
