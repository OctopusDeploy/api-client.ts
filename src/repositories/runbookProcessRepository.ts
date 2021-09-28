import type { RunbookProcessResource, RunbookSnapshotTemplateResource } from "@octopusdeploy/message-contracts";
import BasicRepository from "./basicRepository";
import type { Client } from "../client";

class RunbookProcessRepository extends BasicRepository<RunbookProcessResource, RunbookProcessResource> {
    constructor(client: Client) {
        super("RunbookProcesses", client);
    }
    getRunbookSnapshotTemplate(runbookProcess: RunbookProcessResource, runbookSnapshotId: string) {
        return this.client.get<RunbookSnapshotTemplateResource>(runbookProcess.Links["RunbookSnapshotTemplate"], { runbookSnapshotId });
    }
}
export default RunbookProcessRepository;
