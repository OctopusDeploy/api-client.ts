import { OctopusSpaceRepository } from "../../../repository";
import { CreateDeploymentTenantedCommandV1, CreateDeploymentTenantedResponseV1 } from "./createDeploymentTenantedCommandV1";
import { CreateDeploymentUntenantedCommandV1, CreateDeploymentUntenantedResponseV1 } from "./createDeploymentUntenantedCommandV1";

export async function deployReleaseUntenanted(
    repository: OctopusSpaceRepository,
    command: CreateDeploymentUntenantedCommandV1
): Promise<CreateDeploymentUntenantedResponseV1> {
    console.log(`Deploying a release...`);

    var response = await repository.client.do<CreateDeploymentUntenantedResponseV1>("~/api/{spaceId}/deployments/create/untenanted/v1", command);

    console.log(`Deployment created successfully.`);

    return response;
}

export async function deployReleaseTenanted(
    repository: OctopusSpaceRepository,
    command: CreateDeploymentTenantedCommandV1
): Promise<CreateDeploymentTenantedResponseV1> {
    console.log(`Deploying a tenanted release...`);

    var response = await repository.client.do<CreateDeploymentTenantedResponseV1>("~/api/{spaceId}/deployments/create/tenanted/v1", command);

    console.log(`Tenanted Deployment(s) created successfully.`);

    return response;
}
