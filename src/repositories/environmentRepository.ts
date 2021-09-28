import type {
    DeploymentTargetResource,
    EnvironmentResource,
    EnvironmentSettingsMetadata,
    EnvironmentsSummaryResource,
    NewEnvironmentResource,
    ResourceCollection,
    VariablesScopedToEnvironmentResponse
} from "@octopusdeploy/message-contracts";
import type { Client } from "../client";
import BasicRepository from "./basicRepository";
import type { ListArgs } from "./basicRepository";

type EnvironmentRepositoryListArgs = {
    ids?: string[],
    name?: string;
    partialName?: string;
} & ListArgs;

class EnvironmentRepository extends BasicRepository<EnvironmentResource, NewEnvironmentResource, EnvironmentRepositoryListArgs> {
    constructor(client: Client) {
        super("Environments", client);
    }

    async find(namesOrIds: string[]): Promise<EnvironmentResource[]> {
        if (namesOrIds.length === 0) return [];

        const environments: EnvironmentResource[] = [];

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

    getMetadata(environment: EnvironmentResource): Promise<EnvironmentSettingsMetadata[]> {
        return this.client.get(environment.Links["Metadata"], {});
    }

    sort(order: string[]) {
        return this.client.put(this.client.getLink("EnvironmentSortOrder"), order);
    }

    summary(args?: Partial<EnvironmentSummaryArgs>) {
        return this.client.get<EnvironmentsSummaryResource>(this.client.getLink("EnvironmentsSummary"), args);
    }

    machines(environment: EnvironmentResource, args?: Partial<EnvironmentMachinesArgs>): Promise<ResourceCollection<DeploymentTargetResource>> {
        return this.client.get<ResourceCollection<DeploymentTargetResource>>(environment.Links["Machines"], args);
    }

    variablesScopedOnlyToThisEnvironment(environment: EnvironmentResource): Promise<VariablesScopedToEnvironmentResponse> {
        return this.client.get<VariablesScopedToEnvironmentResponse>(environment.Links["SinglyScopedVariableDetails"]);
    }
}

export type EnvironmentMachinesArgs = {
    skip: number;
    take: number;
    partialName: string | undefined;
    roles: string | null;
    isDisabled: boolean;
    healthStatuses: string | null;
    commStyles: string | null;
    tenantIds: string | null;
    tenantTags: string | null;
    shellNames: string | null;
};

export type EnvironmentSummaryArgs = {
    ids: string;
    partialName: string;
    machinePartialName: string;
    roles: string;
    isDisabled: boolean;
    healthStatuses: string;
    commStyles: string;
    tenantIds: string;
    tenantTags: string;
    hideEmptyEnvironments: boolean;
    shellNames: string;
};

export default EnvironmentRepository;
