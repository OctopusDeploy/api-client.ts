import { Client } from "../../../client";
import { CreateDeploymentTenantedCommandV1, CreateDeploymentTenantedResponseV1 } from "./createDeploymentTenantedCommandV1";
import { CreateDeploymentUntenantedCommandV1, CreateDeploymentUntenantedResponseV1 } from "./createDeploymentUntenantedCommandV1";

export async function deployReleaseUntenanted(
    client: Client,
    command: CreateDeploymentUntenantedCommandV1
): Promise<CreateDeploymentUntenantedResponseV1> {
    client.debug(`Deploying a release...`);

    // WARNING: server's API currently expects there to be a SpaceIdOrName value, which was intended to allow use of names/slugs, but doesn't
    // work properly due to limitations in the middleware. For now, we'll just set it to the SpaceId
    var response = await client.doCreate<CreateDeploymentUntenantedResponseV1>(`~/api/{spaceId}/deployments/create/untenanted/v1`, {
        spaceIdOrName: command.spaceName,
        ...command,
    });

    if (response.deploymentServerTasks.length == 0) {
        throw new Error('No server task details returned')
    }

    client.debug(`Deployment(s) created successfully. [${response.deploymentServerTasks.map(t => t.serverTaskId).join(', ')}]`);

    return response;
}

export async function deployReleaseTenanted(
    client: Client,
    command: CreateDeploymentTenantedCommandV1
): Promise<CreateDeploymentTenantedResponseV1> {
    client.debug(`Deploying a tenanted release...`);

    // WARNING: server's API currently expects there to be a SpaceIdOrName value, which was intended to allow use of names/slugs, but doesn't
    // work properly due to limitations in the middleware. For now, we'll just set it to the SpaceId
    var response = await client.doCreate<CreateDeploymentTenantedResponseV1>(`~/api/{spaceId}/deployments/create/tenanted/v1`, {
        spaceIdOrName: command.spaceName,
        ...command,
    });

    if (response.deploymentServerTasks.length == 0) {
        throw new Error('No server task details returned')
    }

    client.debug(`Tenanted Deployment(s) created successfully. [${response.deploymentServerTasks.map(t => t.serverTaskId).join(', ')}]`);

    return response;
}
