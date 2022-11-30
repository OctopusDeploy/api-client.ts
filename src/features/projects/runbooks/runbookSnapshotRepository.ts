import { Client } from "../../../client";
import { spaceScopedRoutePrefix } from "../../../spaceScopedRoutePrefix";
import { Project } from "../project";
import { Runbook } from "./runbook";
import { NewRunbookSnapshot, RunbookSnapshot } from "./runbookSnapshot";

export class RunbookSnapshotRepository {
    private readonly client: Client;
    private readonly spaceName: string;
    private readonly projectId: string;

    constructor(client: Client, spaceName: string, project: Project) {
        this.client = client;
        this.spaceName = spaceName;
        this.projectId = project.Id;
    }

    async create(runbook: Runbook, name: string, publish: boolean, notes?: string): Promise<RunbookSnapshot> {
        const snapshot: NewRunbookSnapshot = {
            ProjectId: this.projectId,
            RunbookId: runbook.Id,
            Name: name,
            Notes: notes,
            Publish: publish ? "true" : undefined,
        };

        const response = await this.client.doCreate<RunbookSnapshot>(`${spaceScopedRoutePrefix}/projects/{projectId}/runbookSnapshots`, snapshot, {
            spaceName: this.spaceName,
            projectId: this.projectId,
        });
        return response;
    }
}
