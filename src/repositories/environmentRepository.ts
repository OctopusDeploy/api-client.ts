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
import { BasicRepositoryV2, ListArgsV2 } from "./basicRepositoryV2";

type EnvironmentRepositoryListArgs = {
    ids?: string[],
    partialName?: string;
} & ListArgsV2;

export class EnvironmentRepository extends BasicRepositoryV2<EnvironmentResource, NewEnvironmentResource, EnvironmentRepositoryListArgs> {
    constructor(client: Client) {
        super(client, "~/api/{spaceId}/environments{/id}{?skip,take,ids,partialName}");
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
                partialName: name,
            });
            environments.push(...matchingEnvironments.Items.filter((e) => e.Name.localeCompare(name, undefined, { sensitivity: 'base' }) === 0));
        }

        return environments;
    }

    getMetadata(environment: EnvironmentResource): Promise<EnvironmentSettingsMetadata[]> {
        return this.client.get('~/api/{spaceId}/environments/{id}/metadata', { spaceId: environment.SpaceId, id: environment.Id });
    }

    sort(order: string[]) {
        return this.client.put('~/api/{spaceId}/environments/sortorder', order);
    }

    summary(spaceId: string, args?: Partial<EnvironmentSummaryArgs>) {
        return this.client.get<EnvironmentsSummaryResource>('~/api/{spaceId}/environments/summary{?ids,partialName,machinePartialName,roles,isDisabled,healthStatuses,commStyles,tenantIds,tenantTags,hideEmptyEnvironments,shellNames,deploymentTargetTypes}', { spaceId, ...args });
    }

    machines(environment: EnvironmentResource, args?: Partial<EnvironmentMachinesArgs>): Promise<ResourceCollection<DeploymentTargetResource>> {
        return this.client.get<ResourceCollection<DeploymentTargetResource>>('~/api/{spaceId}/environments/{id}/machines{?skip,take,partialName,roles,isDisabled,healthStatuses,commStyles,tenantIds,tenantTags,shellNames,deploymentTargetTypes}', { spaceId: environment.SpaceId, id: environment.Id, ...args });
    }

    variablesScopedOnlyToThisEnvironment(environment: EnvironmentResource): Promise<VariablesScopedToEnvironmentResponse> {
        return this.client.get<VariablesScopedToEnvironmentResponse>('~/api/{spaceId}/environments/{id}/singlyScopedVariableDetails', { spaceId: environment.SpaceId, id: environment.Id });
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