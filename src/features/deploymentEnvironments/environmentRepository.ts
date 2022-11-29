import type { Client } from "../../client";
import { ListArgs } from "../basicRepository";
import { ResourceCollection } from "../resourceCollection";
import { SpaceScopedBasicRepository } from "../spaceScopedBasicRepository";
import { spaceScopedRoutePrefix } from "../spaceScopedRoutePrefix";
import { DeploymentEnvironment, NewDeploymentEnvironment } from "./deploymentEnvironment";

type EnvironmentRepositoryListArgs = {
    ids?: string[];
    partialName?: string;
} & ListArgs;

export class EnvironmentRepository extends SpaceScopedBasicRepository<DeploymentEnvironment, NewDeploymentEnvironment, EnvironmentRepositoryListArgs> {
    constructor(client: Client, spaceName: string) {
        super(client, spaceName, `${spaceScopedRoutePrefix}/environments{/id}{?skip,take,ids,partialName}`);
    }

    // getMetadata(environment: DeploymentEnvironment): Promise<EnvironmentSettingsMetadata[]> {
    //     return this.client.get('${spaceScopedRoutePrefix}/environments/{id}/metadata', { spaceId: environment.SpaceId, id: environment.Id });
    // }

    sort(order: string[]) {
        return this.client.doUpdate(`${spaceScopedRoutePrefix}/environments/sortorder`, order, { spaceName: this.spaceName });
    }

    summary(args?: Partial<EnvironmentSummaryArgs>) {
        return this.client.request<DeploymentEnvironment>(
            `${spaceScopedRoutePrefix}/environments/summary{?ids,partialName,machinePartialName,roles,isDisabled,healthStatuses,commStyles,tenantIds,tenantTags,hideEmptyEnvironments,shellNames,deploymentTargetTypes}`,
            { spaceName: this.spaceName, ...args }
        );
    }

    machines(environment: DeploymentEnvironment, args?: Partial<EnvironmentMachinesArgs>): Promise<ResourceCollection<DeploymentEnvironment>> {
        return this.client.request<ResourceCollection<DeploymentEnvironment>>(
            `${spaceScopedRoutePrefix}/environments/{id}/machines{?skip,take,partialName,roles,isDisabled,healthStatuses,commStyles,tenantIds,tenantTags,shellNames,deploymentTargetTypes}`,
            { spaceName: this.spaceName, id: environment.Id, ...args }
        );
    }

    variablesScopedOnlyToThisEnvironment(environment: DeploymentEnvironment): Promise<VariablesScopedToEnvironmentResponse> {
        return this.client.request<VariablesScopedToEnvironmentResponse>(`${spaceScopedRoutePrefix}/environments/{id}/singlyScopedVariableDetails`, {
            spaceName: this.spaceName,
            id: environment.Id,
        });
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

export interface VariablesScopedToEnvironmentResponse {
    HasUnauthorizedProjectVariables: boolean;
    HasUnauthorizedLibraryVariableSetVariables: boolean;
    VariableMap: Record<string, unknown>;
}
