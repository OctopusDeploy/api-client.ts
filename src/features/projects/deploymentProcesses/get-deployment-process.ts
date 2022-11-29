import { Client, GitRef } from "../../..";
import { Project } from "../project";
import { DeploymentProcess } from "./deploymentProcess";

export async function deploymentProcessGet(client: Client, project: Project): Promise<DeploymentProcess> {
    const response = await client.get<DeploymentProcess>("~/api/{spaceId}/projects/{projectId}/deploymentprocesses", {
        spaceId: project.SpaceId,
        projectId: project.Id,
    });

    return response;
}

export async function deploymentProcessGetByGitRef(client: Client, project: Project, gitRef: GitRef): Promise<DeploymentProcess> {
    const response = await client.get<DeploymentProcess>("~/api/{spaceId}/projects/{projectId}/{gitRef}/deploymentprocesses", {
        spaceId: project.SpaceId,
        projectId: project.Id,
        gitRef,
    });

    return response;
}
