import { Client, GitRef, Project, spaceScopedRoutePrefix } from "../../..";
import { DeploymentProcess } from "./deploymentProcess";

export async function deploymentProcessUpdate(client: Client, project: Project, deploymentProcess: DeploymentProcess): Promise<DeploymentProcess> {
    const response = await client.update<DeploymentProcess>(
        `${spaceScopedRoutePrefix}/projects/{projectId}/deploymentprocesses{/deploymentProcessId}`,
        deploymentProcess,
        {
            spaceId: deploymentProcess.SpaceId,
            projectId: project.Id,
            deploymentProcessId: deploymentProcess.Id,
        }
    );

    return response;
}

export async function deploymentProcessUpdateByGitRef(
    client: Client,
    project: Project,
    deploymentProcess: DeploymentProcess,
    gitRef: GitRef
): Promise<DeploymentProcess> {
    const response = await client.update<DeploymentProcess>(`${spaceScopedRoutePrefix}/projects/{projectId}/{gitRef}/deploymentprocesses`, deploymentProcess, {
        spaceId: deploymentProcess.SpaceId,
        projectId: project.Id,
        deploymentProcessId: deploymentProcess.Id,
        gitRef,
    });

    return response;
}
