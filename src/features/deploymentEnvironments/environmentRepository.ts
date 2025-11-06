import { Client, DeploymentEnvironmentV2, spaceScopedRoutePrefix } from "../..";
import { ListArgs } from "../basicRepository";
import { ResourceCollection } from "../../resourceCollection";
import { SpaceScopedBasicRepository } from "../spaceScopedBasicRepository";
import { DeploymentEnvironment, NewDeploymentEnvironment } from "./deploymentEnvironment";
import { error } from "console";

type EnvironmentRepositoryListArgs = {
    ids?: string[];
    partialName?: string;
} & ListArgs;

export class EnvironmentRepository extends SpaceScopedBasicRepository<DeploymentEnvironmentV2, NewDeploymentEnvironment, EnvironmentRepositoryListArgs> {
    constructor(client: Client, spaceName: string) {
        super(client, spaceName, `${spaceScopedRoutePrefix}/environments`, "skip,take,ids,partialName");
    }

    // getMetadata(environment: DeploymentEnvironment): Promise<EnvironmentSettingsMetadata[]> {
    //     return this.client.get('${spaceScopedRoutePrefix}/environments/{id}/metadata', { spaceId: environment.SpaceId, id: environment.Id });
    // }

    sort(order: string[]) {
        return this.client.doUpdate(`${this.baseApiPathTemplate}/sortorder`, order, { spaceName: this.spaceName });
    }

    summary(args?: Partial<EnvironmentSummaryArgs>) {
        return this.client.request<DeploymentEnvironment>(
            `${this.baseApiPathTemplate}/summary{?ids,partialName,machinePartialName,roles,isDisabled,healthStatuses,commStyles,tenantIds,tenantTags,hideEmptyEnvironments,shellNames,deploymentTargetTypes}`,
            { spaceName: this.spaceName, ...args }
        );
    }

    machines(environment: DeploymentEnvironment, args?: Partial<EnvironmentMachinesArgs>): Promise<ResourceCollection<DeploymentEnvironment>> {
        return this.client.request<ResourceCollection<DeploymentEnvironment>>(
            `${this.baseApiPathTemplate}/${environment.Id}/machines{?skip,take,partialName,roles,isDisabled,healthStatuses,commStyles,tenantIds,tenantTags,shellNames,deploymentTargetTypes}`,
            { spaceName: this.spaceName, ...args }
        );
    }

    variablesScopedOnlyToThisEnvironment(environment: DeploymentEnvironment): Promise<VariablesScopedToEnvironmentResponse> {
        return this.client.request<VariablesScopedToEnvironmentResponse>(`${spaceScopedRoutePrefix}/environments/{id}/singlyScopedVariableDetails`, {
            spaceName: this.spaceName,
            id: environment.Id,
        });
    }

    async createEphemeralEnvironment(environmentName: string, projectId: string): Promise<CreateEphemeralEnvironmentResponse> {
        const response = await this.client.doCreate<CreateEphemeralEnvironmentResponse>(
            `${spaceScopedRoutePrefix}/projects/{projectId}/environments/ephemeral`,
            { EnvironmentName: environmentName },
            {
                spaceName: this.spaceName,
                projectId: projectId,
            }
        );
        return response;
    }

    async getEphemeralEnvironmentProjectStatus(environmentId: string, projectId: string): Promise<GetEphemeralEnvironmentProjectStatusResponse> {
        const response = await this.client.request<GetEphemeralEnvironmentProjectStatusResponse>(
            `${spaceScopedRoutePrefix}/projects/{projectId}/environments/ephemeral/{id}/status`,
            {
                spaceName: this.spaceName,
                projectId: projectId,
                id: environmentId,
            }
        );
        return response;
    }

    async deprovisionEphemeralEnvironmentForProject(environmentId: string, projectId: string): Promise<DeprovisionEphemeralEnvironmentProjectResponse> {
        const response = await this.client.doCreate<DeprovisionEphemeralEnvironmentProjectResponse>(
            `${spaceScopedRoutePrefix}/projects/{projectId}/environments/ephemeral/{environmentId}/deprovision`,
            {},
            {
                spaceName: this.spaceName,
                environmentId: environmentId,
                projectId: projectId,
            }
        );
        return response;
    }

    async deprovisionEphemeralEnvironment(environmentId: string): Promise<DeprovisionEphemeralEnvironmentResponse> {
        const response = await this.client.doCreate<DeprovisionEphemeralEnvironmentResponse>(
            `${spaceScopedRoutePrefix}/environments/ephemeral/{environmentId}/deprovision`,
            {},
            {
                spaceName: this.spaceName,
                environmentId: environmentId,
            }
        );
        return response;
    }

    async getEnvironmentByName(environmentName: string): Promise<DeploymentEnvironmentV2 | null> {
        const listResponse = await this.client.request<ResourceCollection<DeploymentEnvironmentV2>>(
            `${spaceScopedRoutePrefix}/environments/v2{?partialName,take,skip}`,
            {
                spaceName: this.spaceName,
                partialName: environmentName,
                skip: 0,
                take: 100,
            }
        );

        const matchingEnvironments = listResponse.Items.filter((env) => env.Name.toLowerCase() === environmentName.toLowerCase());

        if (matchingEnvironments.length > 1) {
            throw error(`Multiple environments found with the name '${environmentName}`);
        }

        return matchingEnvironments.length == 1 ? matchingEnvironments[0] : null;
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

export interface CreateEphemeralEnvironmentResponse {
    Id: string;
}

export type DeprovisioningRunbookRun = {
    RunbookRunId: string;
    TaskId: string;
};

export interface DeprovisionEphemeralEnvironmentProjectResponse {
    DeprovisioningRun?: DeprovisioningRunbookRun;
}

export interface DeprovisionEphemeralEnvironmentResponse {
    DeprovisioningRuns?: DeprovisioningRunbookRun[];
}

export interface GetEphemeralEnvironmentProjectStatusResponse {
    Status: string;
}
