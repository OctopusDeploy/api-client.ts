import { Client } from "../../../client";
import { spaceScopedRoutePrefix } from "../../../spaceScopedRoutePrefix";
import { ListArgs } from "../../basicRepository";
import { SpaceScopedBasicRepository } from "../../spaceScopedBasicRepository";
import { GitRef, Project } from "../project";
import { NewRunbook, Runbook } from "./runbook";

type RunbookListArgs = {
    ids?: string[];
    partialName?: string;
} & ListArgs;

export class RunbookRepository extends SpaceScopedBasicRepository<Runbook, NewRunbook, RunbookListArgs> {
    private readonly projectId: string;

    constructor(client: Client, spaceName: string, project: Project) {
        super(client, spaceName, `${spaceScopedRoutePrefix}/projects/${project.Id}/runbooks`, "skip,take,ids,partialName");

        this.projectId = project.Id;
    }

    async getWithGitRef(slug: string, gitRef: GitRef): Promise<Runbook> {
        const response = await this.client.request<Runbook>(`${spaceScopedRoutePrefix}/projects/{projectId}/{gitRef}/runbooks{/id}`, {
            spaceName: this.spaceName,
            projectId: this.projectId,
            id: slug,
            gitRef,
        });
        return response;
    }

    async createWithGitRef(runbook: NewRunbook, gitRef: GitRef): Promise<Runbook> {
        const response = await this.client.doCreate<Runbook>(`${spaceScopedRoutePrefix}/projects/{projectId}/{gitRef}/runbooks/v2`, runbook, {
            spaceName: this.spaceName,
            projectId: this.projectId,
            gitRef,
        });

        return response;
    }

    async modifyWithGitRef(runbook: Runbook, gitRef: GitRef): Promise<Runbook> {
        const response = await this.client.doUpdate<Runbook>(`${spaceScopedRoutePrefix}/projects/{projectId}/{gitRef}/runbooks{/id}`, runbook, {
            spaceName: this.spaceName,
            projectId: this.projectId,
            id: runbook.Id,
            gitRef,
        });

        return response;
    }

    async deleteWithGitRef(runbook: Runbook, gitRef: GitRef) {
        const response = await this.client.del(`${spaceScopedRoutePrefix}/projects/{projectId}/{gitRef}/runbooks{/id}`, {
            spaceName: this.spaceName,
            projectId: this.projectId,
            id: runbook.Id,
            gitRef,
        });

        return response;
    }
}
