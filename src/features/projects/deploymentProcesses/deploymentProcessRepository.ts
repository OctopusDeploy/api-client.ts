import { Client, GitRef, spaceScopedRoutePrefix } from "../../..";
import { Project } from "../project";
import { DeploymentProcess } from "./deploymentProcess";

export class DeploymentProcessRepository {
    private readonly client: Client;
    private readonly spaceName: string;

    constructor(client: Client, spaceName: string) {
        this.client = client;
        this.spaceName = spaceName;
    }

    async get(project: Project): Promise<DeploymentProcess> {
        const response = await this.client.request<DeploymentProcess>(`${spaceScopedRoutePrefix}/projects/{projectId}/deploymentprocesses`, {
            spaceName: this.spaceName,
            projectId: project.Id,
        });
        return response;
    }

    async getByGitRef(project: Project, gitRef: GitRef): Promise<DeploymentProcess> {
        const response = await this.client.request<DeploymentProcess>(`${spaceScopedRoutePrefix}/projects/{projectId}/{gitRef}/deploymentprocesses`, {
            spaceName: this.spaceName,
            projectId: project.Id,
            gitRef,
        });
        return response;
    }

    async update(project: Project, deploymentProcess: DeploymentProcess): Promise<DeploymentProcess> {
        const response = await this.client.doUpdate<DeploymentProcess>(
            `${spaceScopedRoutePrefix}/projects/{projectId}/deploymentprocesses`,
            deploymentProcess,
            {
                spaceName: this.spaceName,
                projectId: project.Id,
            }
        );

        return response;
    }

    async updateByGitRef(project: Project, deploymentProcess: DeploymentProcess, gitRef: GitRef): Promise<DeploymentProcess> {
        const response = await this.client.doUpdate<DeploymentProcess>(
            `${spaceScopedRoutePrefix}/projects/{projectId}/{gitRef}/deploymentprocesses`,
            deploymentProcess,
            {
                spaceName: this.spaceName,
                projectId: project.Id,
                gitRef,
            }
        );

        return response;
    }
}
