import { Client, spaceScopedRoutePrefix } from "../..";
import { ListArgs } from "..";
import { NewTenant, Tenant, TagTestResult } from "./tenant";
import { TenantVariable, GetCommonVariablesByTenantIdResponse, GetProjectVariablesByTenantIdResponse, ModifyCommonVariablesByTenantIdResponse, ModifyProjectVariablesByTenantIdResponse } from "./tenantVariable";
import { TenantMissingVariable } from "./tenantMissingVariables";
import { SpaceScopedBasicRepository } from "../spaceScopedBasicRepository";

type TenantRepositoryListArgs = {
    clone?: boolean;
    clonedFromTenantId?: string;
    ids?: string[];
    partialName?: string;
    projectId?: string;
    tags?: string;
} & ListArgs;

export class TenantRepository extends SpaceScopedBasicRepository<Tenant, NewTenant, TenantRepositoryListArgs> {
    constructor(client: Client, spaceName: string) {
        super(client, spaceName, `${spaceScopedRoutePrefix}/tenants`, "skip,projectId,tags,take,ids,clone,partialName,clonedFromTenantId");
    }

    tagTest(tenantIds: string[], tags: string[]): Promise<TagTestResult> {
        return this.client.request(`${spaceScopedRoutePrefix}/tenants/tag-test{?tenantIds,tags}`, {
            spaceName: this.spaceName,
            tenantIds,
            tags,
        });
    }

    getVariables(tenant: Tenant): Promise<TenantVariable> {
        return this.client.request(`${spaceScopedRoutePrefix}/tenants/{id}/variables`, {
            spaceName: this.spaceName,
            id: tenant.Id,
        });
    }

    setVariables(tenant: Tenant, variables: any): Promise<TenantVariable> {
        return this.client.doUpdate(`${spaceScopedRoutePrefix}/tenants/{id}/variables`, variables, {
            spaceName: this.spaceName,
            id: tenant.Id,
        });
    }

    missingVariables(filterOptions: FilterOptions = {}, includeDetails: boolean = false): Promise<TenantMissingVariable[]> {
        const payload = {
            spaceName: this.spaceName,
            environmentId: filterOptions.environmentId,
            includeDetails: includeDetails,
            projectId: filterOptions.projectId,
            tenantId: filterOptions.tenantId,
        };
        return this.client.request(`${spaceScopedRoutePrefix}/tenants/variables-missing{?tenantId,projectId,environmentId,includeDetails}`, payload);
    }

    getCommonVariables(tenant: Tenant, includeMissingVariables: boolean = false): Promise<GetCommonVariablesByTenantIdResponse> {
        return this.client.request(`${spaceScopedRoutePrefix}/tenants/{id}/commonvariables{?includeMissingVariables}`, {
            spaceName: this.spaceName,
            id: tenant.Id,
            includeMissingVariables,
        });
    }

    getCommonVariablesById(tenantId: string, includeMissingVariables: boolean = false): Promise<GetCommonVariablesByTenantIdResponse> {
        return this.client.request(`${spaceScopedRoutePrefix}/tenants/{id}/commonvariables{?includeMissingVariables}`, {
            spaceName: this.spaceName,
            id: tenantId,
            includeMissingVariables,
        });
    }

    getProjectVariables(tenant: Tenant, includeMissingVariables: boolean = false): Promise<GetProjectVariablesByTenantIdResponse> {
        return this.client.request(`${spaceScopedRoutePrefix}/tenants/{id}/projectvariables{?includeMissingVariables}`, {
            spaceName: this.spaceName,
            id: tenant.Id,
            includeMissingVariables,
        });
    }

    getProjectVariablesById(tenantId: string, includeMissingVariables: boolean = false): Promise<GetProjectVariablesByTenantIdResponse> {
        return this.client.request(`${spaceScopedRoutePrefix}/tenants/{id}/projectvariables{?includeMissingVariables}`, {
            spaceName: this.spaceName,
            id: tenantId,
            includeMissingVariables,
        });
    }

    setCommonVariables(tenant: Tenant, variables: GetCommonVariablesByTenantIdResponse): Promise<ModifyCommonVariablesByTenantIdResponse> {
        return this.client.doUpdate(`${spaceScopedRoutePrefix}/tenants/{id}/commonvariables`, variables, {
            spaceName: this.spaceName,
            id: tenant.Id,
        });
    }

    setCommonVariablesById(tenantId: string, variables: GetCommonVariablesByTenantIdResponse): Promise<ModifyCommonVariablesByTenantIdResponse> {
        return this.client.doUpdate(`${spaceScopedRoutePrefix}/tenants/{id}/commonvariables`, variables, {
            spaceName: this.spaceName,
            id: tenantId,
        });
    }

    setProjectVariables(tenant: Tenant, variables: GetProjectVariablesByTenantIdResponse): Promise<ModifyProjectVariablesByTenantIdResponse> {
        return this.client.doUpdate(`${spaceScopedRoutePrefix}/tenants/{id}/projectvariables`, variables, {
            spaceName: this.spaceName,
            id: tenant.Id,
        });
    }

    setProjectVariablesById(tenantId: string, variables: GetProjectVariablesByTenantIdResponse): Promise<ModifyProjectVariablesByTenantIdResponse> {
        return this.client.doUpdate(`${spaceScopedRoutePrefix}/tenants/{id}/projectvariables`, variables, {
            spaceName: this.spaceName,
            id: tenantId,
        });
    }
}

type FilterOptions = {
    tenantId?: string;
    projectId?: string;
    environmentId?: string;
};
