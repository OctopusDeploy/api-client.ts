import type {
    MultiTenancyStatusResource,
    NewTenantResource,
    ResourceCollection,
    TagTestResult,
    TenantMissingVariableResource,
    TenantVariableResource,
    TenantResource
} from "@octopusdeploy/message-contracts";
import type { AllArgs, ListArgs } from "./basicRepository";
import BasicRepository from "./basicRepository";
import type { Client } from "../client";

type TenantAllArgs = {
    projectId?: string;
} & AllArgs;

type TenantRepositoryListArgs = {
    clone?: boolean;
    clonedFromTenantId?: string;
    ids?: string[],
    name?: string;
    partialName?: string;
    projectId?: string;
    tags?: string;
} & ListArgs;

class TenantRepository extends BasicRepository<TenantResource, NewTenantResource, TenantRepositoryListArgs, TenantAllArgs> {
    constructor(client: Client) {
        super("Tenants", client);
    }

    async find(namesOrIds: string[]): Promise<TenantResource[]> {
        if (namesOrIds.length === 0) return [];

        const environments: TenantResource[] = [];

        try {
            const matchingEnvironments = await this.list({
                ids: namesOrIds,
            });
            environments.push(...matchingEnvironments.Items)
        } catch {
            // silently capture all exceptions; assume no IDs were found
        }

        for (const name of namesOrIds) {
            const matchingEnvironments = await this.list({
                name: name,
            });
            environments.push(...matchingEnvironments.Items.filter((e) => e.Name.localeCompare(name, undefined, { sensitivity: 'base' }) === 0));
        }

        return environments;
    }

    status(): Promise<MultiTenancyStatusResource> {
        return this.client.get(this.client.getLink("TenantsStatus"));
    }

    tagTest(tenantIds: string[], tags: string[]): Promise<TagTestResult> {
        return this.client.get(this.client.getLink("TenantTagTest"), { tenantIds, tags });
    }

    getVariables(tenant: TenantResource): Promise<TenantVariableResource> {
        return this.client.get(tenant.Links["Variables"]);
    }

    setVariables(tenant: TenantResource, variables: any): Promise<TenantVariableResource> {
        return this.client.put(tenant.Links["Variables"], variables);
    }

    missingVariables(filterOptions: FilterOptions = {}, includeDetails: boolean = false): Promise<TenantMissingVariableResource[]> {
        const payload = {
            environmentId: filterOptions.environmentId,
            includeDetails: !!includeDetails,
            projectId: filterOptions.projectId,
            tenantId: filterOptions.tenantId,
        };
        return this.client.get(this.client.getLink("TenantsMissingVariables"), payload);
    }

    list(args?: TenantRepositoryListArgs): Promise<ResourceCollection<TenantResource>> {
        return this.client.get(this.client.getLink("Tenants"), { ...args });
    }
}

type FilterOptions = {
    tenantId?: string;
    projectId?: string;
    environmentId?: string;
};

export default TenantRepository;
