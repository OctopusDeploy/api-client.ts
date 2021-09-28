import type {
    DeploymentPromotionTarget,
    ResourceCollection,
    RunbookRunResource,
    RunbookRunPreviewResource,
    RunbookRunTemplateResource,
    RunbookSnapshotResource
} from "@octopusdeploy/message-contracts"
import type { ListArgs } from "./basicRepository";
import BasicRepository from "./basicRepository";
import type { Client } from "../client";

type GetRunbookRunArgs = ListArgs;

class RunbookSnapshotRepository extends BasicRepository<RunbookSnapshotResource, RunbookSnapshotResource> {
    constructor(client: Client) {
        super("RunbookSnapshots", client);
    }
    getRunbookRuns(runbookSnapshot: RunbookSnapshotResource, options?: GetRunbookRunArgs): Promise<ResourceCollection<RunbookRunResource>> {
        return this.client.get(runbookSnapshot.Links["RunbookRuns"], options);
    }
    getRunbookRunTemplate(runbookSnapshot: RunbookSnapshotResource): Promise<RunbookRunTemplateResource> {
        return this.client.get(runbookSnapshot.Links["RunbookRunTemplate"]) as Promise<RunbookRunTemplateResource>;
    }
    getRunbookRunPreviewForPromotionTarget(promotionTarget: DeploymentPromotionTarget) {
        return this.client.get<RunbookRunPreviewResource>(promotionTarget.Links["RunbookRunPreview"], { includeDisabledSteps: true });
    }
    snapshotVariables(runbookSnapshot: RunbookSnapshotResource): Promise<RunbookSnapshotResource> {
        return this.client.post(runbookSnapshot.Links["SnapshotVariables"]);
    }
}

export default RunbookSnapshotRepository;
