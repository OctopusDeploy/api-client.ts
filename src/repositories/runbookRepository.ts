import type {
    DeploymentPromotionTarget,
    EnvironmentResource,
    NewNonVcsRunbookResource,
    NonVcsRunbookResource,
    ProjectResource,
    ResourceCollection,
    RunbookResource,
    RunbookRunPreviewResource,
    RunbookRunResource,
    RunbookRunTemplateResource,
    RunbookSnapshotResource,
    RunbookSnapshotTemplateResource
} from "@octopusdeploy/message-contracts";
import { RunbookRunParameters } from "@octopusdeploy/message-contracts";
import { SemVer } from "semver";
import type { AllArgs } from "./basicRepository";
import { BasicRepository } from "./basicRepository";
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

export class RunbookRepository extends BasicRepository<NonVcsRunbookResource, NewNonVcsRunbookResource, RunbookRepositoryListArgs, RunbookRepositoryAllArgs> {
    private readonly integrationTestVersion: SemVer = new SemVer("0.0.0-local");
    private readonly versionAfterWhichRunbookRunParametersAreAvailable: SemVer = new SemVer("2020.3.1");

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

    async run(runbook: RunbookResource, runbookRun: RunbookRunResource): Promise<RunbookRunResource> {
        let supportsRunbookRunParameters: boolean = this.serverSupportsRunbookRunParameters(this.client.getServerInformation().version);

        return supportsRunbookRunParameters
            ? (await this.runWithParameters(runbook, RunbookRunParameters.MapFrom(runbookRun)))[0]
            : await this.client.post<RunbookRunResource>(runbook.Links["CreateRunbookRun"], runbookRun);
    }

    async runWithParameters(runbook: RunbookResource, runbookRunParameters: RunbookRunParameters): Promise<RunbookRunResource[]> {
        var serverVersion = this.client.getServerInformation().version;
        var serverSupportsRunbookRunParameters = this.serverSupportsRunbookRunParameters(serverVersion);

        if (!serverSupportsRunbookRunParameters) throw new Error(`This Octopus Deploy server is an older version ${serverVersion} that does not yet support RunbookRunParameters. Please update your Octopus Deploy server to 2020.3.* or newer to access this feature.`);
        return await this.client.post<RunbookRunResource[]>(runbook.Links["CreateRunbookRun"], runbookRunParameters);
    }

    private serverSupportsRunbookRunParameters(version: string): boolean {
        let serverVersion = new SemVer(version);

        // note: ensure the server version is >= *any* 2020.3.1
        return serverVersion >= this.versionAfterWhichRunbookRunParametersAreAvailable || serverVersion == this.integrationTestVersion;
    }
}