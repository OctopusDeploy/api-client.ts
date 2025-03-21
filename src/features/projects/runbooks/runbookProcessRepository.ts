import { Client } from "../../../client";
import { spaceScopedRoutePrefix } from "../../../spaceScopedRoutePrefix";
import { GitRef, Project } from "../project";
import { Runbook } from "./runbook";
import { RunbookProcess } from "./runbookProcess";

export class RunbookProcessRepository {
    private readonly client: Client;
    private readonly spaceName: string;
    private readonly projectId: string;

    constructor(client: Client, spaceName: string, project: Project) {
        this.client = client;
        this.spaceName = spaceName;
        this.projectId = project.Id;
    }

    async get(runbook: Runbook): Promise<RunbookProcess> {
        const response = await this.client.request<RunbookProcess>(`${spaceScopedRoutePrefix}/projects/{projectId}/runbookProcesses{/id}`, {
            spaceName: this.spaceName,
            projectId: this.projectId,
            id: runbook.RunbookProcessId,
        });
        return response;
    }

    async getWithGitRef(runbook: Runbook, gitRef: GitRef): Promise<RunbookProcess> {
        const response = await this.client.request<RunbookProcess>(`${spaceScopedRoutePrefix}/projects/{projectId}/{gitRef}/runbookProcesses{/id}`, {
            spaceName: this.spaceName,
            projectId: this.projectId,
            id: runbook.RunbookProcessId,
            gitRef,
        });
        return response;
    }

    async update(runbookProcess: RunbookProcess): Promise<RunbookProcess> {
        const response = await this.client.doUpdate<RunbookProcess>(`${spaceScopedRoutePrefix}/projects/{projectId}/runbookProcesses{/id}`, runbookProcess, {
            spaceName: this.spaceName,
            projectId: this.projectId,
            id: runbookProcess.Id,
        });

        return response;
    }

    async updateWithGitRef(runbookProcess: RunbookProcess, gitRef: GitRef): Promise<RunbookProcess> {
        const response = await this.client.doUpdate<RunbookProcess>(
            `${spaceScopedRoutePrefix}/projects/{projectId}/{gitRef}/runbookProcesses{/id}`,
            runbookProcess,
            {
                spaceName: this.spaceName,
                projectId: this.projectId,
                id: runbookProcess.Id,
                gitRef,
            }
        );

        return response;
    }
}
