/* eslint-disable @typescript-eslint/no-explicit-any */

import type { Client } from "../client";
import type { ProgressionResource, ProjectResource, NonVcsRunbookResource, RunbookProgressionResource, RunbooksDashboardItemResource, ResourceCollection } from "@octopusdeploy/message-contracts";
import type { ListArgs } from "./basicRepository";

export type GetTaskRunDashboardItemsListArgs = {
    projectIds?: string[];
    runbookIds?: string[];
    environmentIds?: string[];
    tenantIds?: string[];
    taskIds?: string[];
} & ListArgs;

class ProgressionRepository {
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
    getTaskRunDashboardItemsForRunbook(runbook: NonVcsRunbookResource, options?: GetTaskRunDashboardItemsListArgs): Promise<ResourceCollection<RunbooksDashboardItemResource>> {
        return this.client.get<ResourceCollection<RunbooksDashboardItemResource>>(runbook.Links["TaskRunDashboardItemsTemplate"], options);
    }
    getTaskRunDashboardItemsForProject(project: ProjectResource, options?: GetTaskRunDashboardItemsListArgs): Promise<ResourceCollection<RunbooksDashboardItemResource>> {
        return this.client.get<ResourceCollection<RunbooksDashboardItemResource>>(project.Links["RunbookTaskRunDashboardItemsTemplate"], options);
    }
}

export default ProgressionRepository;
