import type {
    DeploymentPromotionTarget,
    ResourceCollection,
    RunbookRunResource,
    RunbookRunPreviewResource,
    RunbookRunTemplateResource,
    RunbookSnapshotResource
} from "@octopusdeploy/message-contracts"
import { BasicRepository, ListArgs } from "./basicRepository";
import type { Client } from "../client";

type GetRunbookRunArgs = ListArgs;

export class RunbookSnapshotRepository extends BasicRepository<RunbookSnapshotResource, RunbookSnapshotResource> {
    constructor(client: Client) {
        super("RunbookSnapshots", client);
    }

    getRunbookRunPreviewForPromotionTarget(promotionTarget: DeploymentPromotionTarget) {
        return this.client.get<RunbookRunPreviewResource>(promotionTarget.Links["RunbookRunPreview"], { includeDisabledSteps: true });
    }

    getRunbookRuns(runbookSnapshot: RunbookSnapshotResource, options?: GetRunbookRunArgs): Promise<ResourceCollection<RunbookRunResource>> {
        return this.client.get(runbookSnapshot.Links["RunbookRuns"], options);
    }

    getRunbookRunTemplate(runbookSnapshot: RunbookSnapshotResource): Promise<RunbookRunTemplateResource> {
        return this.client.get(runbookSnapshot.Links["RunbookRunTemplate"]) as Promise<RunbookRunTemplateResource>;
    }

    snapshotVariables(runbookSnapshot: RunbookSnapshotResource): Promise<RunbookSnapshotResource> {
        return this.client.post(runbookSnapshot.Links["SnapshotVariables"]);
    }
}