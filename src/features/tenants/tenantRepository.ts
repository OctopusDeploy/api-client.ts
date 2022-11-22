import type { Client } from "../../client";
import { ListArgsV2, SpaceScopedBasicRepositoryV2 } from "..";
import { NewTenant, Tenant, TagTestResult } from "./tenant";
import { TenantVariable } from "./tenantVariable";
import { TenantMissingVariable } from "./tenantMissingVariables";

type TenantRepositoryListArgs = {
    clone?: boolean;
    clonedFromTenantId?: string;
    ids?: string[];
    partialName?: string;
    projectId?: string;
    tags?: string;
} & ListArgsV2;

export class TenantRepository extends SpaceScopedBasicRepositoryV2<Tenant, NewTenant, TenantRepositoryListArgs> {
    constructor(client: Client, spaceName: string) {
        super(client, spaceName, "~/api/{spaceId}/tenants{/id}{?skip,projectId,tags,take,ids,clone,partialName,clonedFromTenantId}");
    }

    tagTest(tenantIds: string[], tags: string[]): Promise<TagTestResult> {
        return this.client.request("~/api/{spaceId}/tenants/tag-test{?tenantIds,tags}", { tenantIds, tags });
    }

    getVariables(tenant: Tenant): Promise<TenantVariable> {
        return this.client.request("~/api/{spaceId}/tenants/{id}/variables");
    }

    setVariables(tenant: Tenant, variables: any): Promise<TenantVariable> {
        return this.client.doUpdate("~/api/{spaceId}/tenants/{id}/variables", variables);
    }

    missingVariables(filterOptions: FilterOptions = {}, includeDetails: boolean = false): Promise<TenantMissingVariable[]> {
        const payload = {
            environmentId: filterOptions.environmentId,
            includeDetails: !!includeDetails,
            projectId: filterOptions.projectId,
            tenantId: filterOptions.tenantId,
        };
        return this.client.request("~/api/{spaceId}/tenants/variables-missing{?tenantId,projectId,environmentId,includeDetails}", payload);
    }
}

type FilterOptions = {
    tenantId?: string;
    projectId?: string;
    environmentId?: string;
};
