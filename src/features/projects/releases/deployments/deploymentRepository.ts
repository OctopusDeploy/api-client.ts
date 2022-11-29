import type { Client } from "../../../../client";
import { ResourceCollection, ListArgs, spaceScopedRoutePrefix } from "../../..";
import { TaskState } from "../../../serverTasks";
import { Deployment } from "./deployment";
import {
    CreateDeploymentTenantedCommandV1,
    CreateDeploymentTenantedResponseV1,
    CreateDeploymentUntenantedCommandV1,
    CreateDeploymentUntenantedResponseV1,
} from ".";

// WARNING: we've had to do this to cover a mistake in Octopus' API. The API has been corrected to return PascalCase, but was returning camelCase
// for a number of versions, so we'll deserialize both and use whichever actually has a value
interface InternalDeploymentServerTask {
    DeploymentId: string;
    deploymentId: string;
    ServerTaskId: string;
    serverTaskId: string;
}

interface InternalCreateDeploymentResponseV1 {
    DeploymentServerTasks: InternalDeploymentServerTask[];
}

type DeploymentListArgs = {
    ids?: string[];
    projects?: string[];
    environments?: string[];
    tenants?: string[];
    channels?: string[];
    taskState?: TaskState;
} & ListArgs;

export class DeploymentRepository {
    private baseApiTemplate = `${spaceScopedRoutePrefix}/deployments{/id}{?skip,take,ids,projects,environments,tenants,channels,taskState}`;
    private client: Client;
    private spaceName: string;

    constructor(client: Client, spaceName: string) {
        this.client = client;
        this.spaceName = spaceName;
    }

    get(id: string): Promise<Deployment> {
        return this.client.request(this.baseApiTemplate, { id, spaceName: this.spaceName });
    }

    list(args?: DeploymentListArgs): Promise<ResourceCollection<Deployment>> {
        return this.client.request(this.baseApiTemplate, { spaceName: this.spaceName, ...args });
    }

    async create(command: CreateDeploymentUntenantedCommandV1): Promise<CreateDeploymentUntenantedResponseV1> {
        this.client.debug(`Deploying a release...`);

        // WARNING: server's API currently expects there to be a SpaceIdOrName value, which was intended to allow use of names/slugs, but doesn't
        // work properly due to limitations in the middleware. For now, we'll just set it to the SpaceId
        const response = await this.client.doCreate<InternalCreateDeploymentResponseV1>(`${spaceScopedRoutePrefix}/deployments/create/untenanted/v1`, {
            spaceIdOrName: command.spaceName,
            ...command,
        });

        if (response.DeploymentServerTasks.length == 0) {
            throw new Error("No server task details returned");
        }

        const mappedTasks = response.DeploymentServerTasks.map((x) => {
            return {
                DeploymentId: x.DeploymentId || x.deploymentId,
                ServerTaskId: x.ServerTaskId || x.serverTaskId,
            };
        });

        this.client.debug(`Deployment(s) created successfully. [${mappedTasks.map((t) => t.ServerTaskId).join(", ")}]`);

        return {
            DeploymentServerTasks: mappedTasks,
        };
    }

    async createTenanted(command: CreateDeploymentTenantedCommandV1): Promise<CreateDeploymentTenantedResponseV1> {
        this.client.debug(`Deploying a tenanted release...`);

        // WARNING: server's API currently expects there to be a SpaceIdOrName value, which was intended to allow use of names/slugs, but doesn't
        // work properly due to limitations in the middleware. For now, we'll just set it to the SpaceId
        const response = await this.client.doCreate<InternalCreateDeploymentResponseV1>(`${spaceScopedRoutePrefix}/deployments/create/tenanted/v1`, {
            spaceIdOrName: command.spaceName,
            ...command,
        });

        if (response.DeploymentServerTasks.length == 0) {
            throw new Error("No server task details returned");
        }

        const mappedTasks = response.DeploymentServerTasks.map((x) => {
            return {
                DeploymentId: x.DeploymentId || x.deploymentId,
                ServerTaskId: x.ServerTaskId || x.serverTaskId,
            };
        });

        this.client.debug(`Tenanted Deployment(s) created successfully. [${mappedTasks.map((t) => t.ServerTaskId).join(", ")}]`);

        return {
            DeploymentServerTasks: mappedTasks,
        };
    }
}
