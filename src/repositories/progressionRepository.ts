import type {
    NonVcsRunbookResource,
    ProgressionResource,
    ProjectResource,
    ResourceCollection,
    RunbookProgressionResource,
    RunbooksDashboardItemResource
} from "@octopusdeploy/message-contracts";
import type { Client } from "../client";
import type { ListArgs } from "./basicRepository";

export type GetTaskRunDashboardItemsListArgs = {
    environmentIds?: string[];
    projectIds?: string[];
    runbookIds?: string[];
    taskIds?: string[];
    tenantIds?: string[];
} & ListArgs;

export class ProgressionRepository {
    private client: Client;
    constructor(client: Client) {
        this.client = client;
    }

    getProgression(project: ProjectResource, options?: any): Promise<ProgressionResource> {
        return this.client.get<ProgressionResource>(project.Links["Progression"], options);
    }

    getRunbookProgression(runbook: NonVcsRunbookResource, options?: any): Promise<RunbookProgressionResource> {
        return this.client.get<RunbookProgressionResource>(runbook.Links["Progression"], options);
    }

    getTaskRunDashboardItemsForProject(project: ProjectResource, options?: GetTaskRunDashboardItemsListArgs): Promise<ResourceCollection<RunbooksDashboardItemResource>> {
        return this.client.get<ResourceCollection<RunbooksDashboardItemResource>>(project.Links["RunbookTaskRunDashboardItemsTemplate"], options);
    }

    getTaskRunDashboardItemsForRunbook(runbook: NonVcsRunbookResource, options?: GetTaskRunDashboardItemsListArgs): Promise<ResourceCollection<RunbooksDashboardItemResource>> {
        return this.client.get<ResourceCollection<RunbooksDashboardItemResource>>(runbook.Links["TaskRunDashboardItemsTemplate"], options);
    }
}