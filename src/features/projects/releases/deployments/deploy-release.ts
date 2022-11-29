import { Client } from "../../../../client";
import {
    CreateDeploymentTenantedCommandV1,
    CreateDeploymentTenantedResponseV1,
    CreateDeploymentUntenantedCommandV1,
    CreateDeploymentUntenantedResponseV1,
} from ".";
import { spaceScopedRoutePrefix } from "../../../..";

// WARNING: we've had to do this to cover a mistake in Octopus' API. The API has been corrected to return PascalCase, but was returning camelCase
// for a number of versions, so we'll deserialize both and use whichever actually has a value
interface InternalDeploymentServerTask {
    DeploymentId: string;
    deploymentId: string;
    ServerTaskId: string;
    serverTaskId: string;
}

interface InternalCreateDeploymentUntenantedResponseV1 {
    DeploymentServerTasks: InternalDeploymentServerTask[];
}

export async function deployReleaseUntenanted(client: Client, command: CreateDeploymentUntenantedCommandV1): Promise<CreateDeploymentUntenantedResponseV1> {
    client.debug(`Deploying a release...`);

    // WARNING: server's API currently expects there to be a SpaceIdOrName value, which was intended to allow use of names/slugs, but doesn't
    // work properly due to limitations in the middleware. For now, we'll just set it to the SpaceId
    const response = await client.doCreate<InternalCreateDeploymentUntenantedResponseV1>(`${spaceScopedRoutePrefix}/deployments/create/untenanted/v1`, {
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

    client.debug(`Deployment(s) created successfully. [${mappedTasks.map((t) => t.ServerTaskId).join(", ")}]`);

    return {
        DeploymentServerTasks: mappedTasks,
    };
}

export async function deployReleaseTenanted(client: Client, command: CreateDeploymentTenantedCommandV1): Promise<CreateDeploymentTenantedResponseV1> {
    client.debug(`Deploying a tenanted release...`);

    // WARNING: server's API currently expects there to be a SpaceIdOrName value, which was intended to allow use of names/slugs, but doesn't
    // work properly due to limitations in the middleware. For now, we'll just set it to the SpaceId
    const response = await client.doCreate<InternalCreateDeploymentUntenantedResponseV1>(`${spaceScopedRoutePrefix}/deployments/create/tenanted/v1`, {
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

    client.debug(`Tenanted Deployment(s) created successfully. [${mappedTasks.map((t) => t.ServerTaskId).join(", ")}]`);

    return {
        DeploymentServerTasks: mappedTasks,
    };
}
