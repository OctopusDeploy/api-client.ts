import type {
    DeploymentPromotionTarget,
    EnvironmentResource,
    NewNonVcsRunbookResource,
    NonVcsRunbookResource,
    ProjectResource,
    ResourceCollection,
    RunbookRunPreviewResource,
    RunbookRunTemplateResource,
    RunbookSnapshotResource,
    RunbookSnapshotTemplateResource
} from "@octopusdeploy/message-contracts";
import type { AllArgs } from "./basicRepository";
import BasicRepository from "./basicRepository";
import type { Client } from "../client";
import type { RouteArgs } from "../resolver";

type RunbookRepositoryListArgs = {
    skip?: number;
    take?: number;
    orderBy?: string;
} & RouteArgs;

type RunbookRepositoryAllArgs = {
    projectIds?: string[];
} & AllArgs;

class RunbookRepository extends BasicRepository<NonVcsRunbookResource, NewNonVcsRunbookResource, RunbookRepositoryListArgs, RunbookRepositoryAllArgs> {
    constructor(client: Client) {
        super("Runbooks", client);
    }

    async find(nameOrId: string, project: ProjectResource): Promise<NonVcsRunbookResource | undefined> {
        if (nameOrId.length === 0) return;

        try {
            return await this.get(nameOrId);
        } catch {
            // silently capture any exceptions; it is assumed the ID cannot be found
            // and the algorithm moves on to searching for matching names
        }

        const runbooks = await this.list({
            partialName: nameOrId,
            projectIds: [project.Id]
        });
        return runbooks.Items.find((r) => r.Name === nameOrId);
    }

    getRunbookEnvironments(runbook: NonVcsRunbookResource): Promise<EnvironmentResource[]> {
        return this.client.get<EnvironmentResource[]>(runbook.Links["RunbookEnvironments"]);
    }

    getRunbookRunPreview(promotionTarget: DeploymentPromotionTarget) {
        return this.client.get<RunbookRunPreviewResource>(promotionTarget.Links["RunbookRunPreview"], { includeDisabledSteps: true });
    }

    getRunbookRunTemplate(runbook: NonVcsRunbookResource): Promise<RunbookRunTemplateResource> {
        return this.client.get<RunbookRunTemplateResource>(runbook.Links["RunbookRunTemplate"]);
    }

    getRunbookSnapshots(runbook: NonVcsRunbookResource, args?: { skip?: number; take?: number } & RouteArgs): Promise<ResourceCollection<RunbookSnapshotResource>> {
        return this.client.get<ResourceCollection<RunbookSnapshotResource>>(runbook.Links["RunbookSnapshots"], args);
    }

    getRunbookSnapshotTemplate(runbook: NonVcsRunbookResource): Promise<RunbookSnapshotTemplateResource> {
        return this.client.get<RunbookSnapshotTemplateResource>(runbook.Links["RunbookSnapshotTemplate"]);
    }

    run(runbook: )
}

export default RunbookRepository;
