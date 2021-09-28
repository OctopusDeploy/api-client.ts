/* eslint-disable @typescript-eslint/no-non-null-assertion,@typescript-eslint/consistent-type-assertions */

import type {
    ChannelResource,
    ConvertProjectToVersionControlledCommand,
    ConvertProjectToVersionControlledResponse,
    DeploymentSettingsResource,
    NewProjectResource,
    NonVcsRunbookResource,
    ProjectGroupResource,
    ProjectResource,
    ProjectSettingsMetadata,
    ProjectSummaryResource,
    ProjectSummary,
    ReleaseResource,
    ResourceCollection,
    TriggerActionType,
    TriggerActionCategory,
    TriggerResource,
    VcsBranchResource,
    VersionControlCompatibilityResponse
} from "@octopusdeploy/message-contracts";
import { HasVcsProjectResourceLinks, HasVersionControlledPersistenceSettings } from "@octopusdeploy/message-contracts";
import type { AllArgs } from "./basicRepository";
import { BasicRepository } from "./basicRepository";
import type { Client } from "../client";
import type { RouteArgs } from "../resolver";

export const UseDefaultBranch = { UseDefaultBranch: true };
type UseDefaultBranch = typeof UseDefaultBranch;
export type SpecifiedBranch = string;
export type BranchSpecifier = SpecifiedBranch | UseDefaultBranch;

type ProjectRepositoryListArgs = {
    clone?: boolean;
    clonedFromProjectId?: string;
    name?: string;
    partialName?: string;
    skip?: number;
    take?: number;
} & RouteArgs;

type ProjectRepositoryAllArgs = {
    ids?: string[];
} & AllArgs;

class ProjectRepository extends BasicRepository<ProjectResource, NewProjectResource, ProjectRepositoryListArgs, ProjectRepositoryAllArgs> {
    constructor(client: Client) {
        super("Projects", client);
    }

    async find(nameOrId: string): Promise<ProjectResource | undefined> {
        if (nameOrId.length === 0) return;

        try {
            return await this.get(nameOrId);
        } catch {
            // silently capture any exceptions; it is assumed the ID cannot be found
            // and the algorithm moves on to searching for matching names
        }

        const projects = await this.list({
            partialName: nameOrId,
        });
        return projects.Items.find((p) => p.Name === nameOrId);
    }

    getChannels(project: ProjectResource, branch: VcsBranchResource | undefined, skip: number = 0, take: number = this.takeAll): Promise<ResourceCollection<ChannelResource>> {
        if (branch && HasVcsProjectResourceLinks(project.Links) && HasVersionControlledPersistenceSettings(project.PersistenceSettings)) {
            return this.client.get<ResourceCollection<ChannelResource>>(branch.Links["Channels"], { skip, take });
        }
        return this.client.get<ResourceCollection<ChannelResource>>(project.Links["Channels"], { skip, take });
    }

    getDeployments(project: ProjectResource) {
        return this.client.get(this.client.getLink("Deployments"), { projects: project.Id });
    }

    getDeploymentSettings(project: ProjectResource): Promise<DeploymentSettingsResource> {
        return this.client.get(project.Links["DeploymentSettings"]);
    }

    getReleases(project: ProjectResource, args?: { skip?: number; take?: number; searchByVersion?: string }): Promise<ResourceCollection<ReleaseResource>> {
        return this.client.get<ResourceCollection<ReleaseResource>>(project.Links["Releases"], args!);
    }

    getReleaseByVersion(project: ProjectResource, version: string): Promise<ReleaseResource> {
        return this.client.get(project.Links["Releases"], { version });
    }

    list(args?: ProjectRepositoryListArgs): Promise<ResourceCollection<ProjectResource>> {
        return this.client.get(this.client.getLink("Projects"), { ...args });
    }

    listByGroup(projectGroup: ProjectGroupResource): Promise<ResourceCollection<ProjectResource>> {
        return this.client.get(projectGroup.Links["Projects"]);
    }

    getTriggers(
        project: ProjectResource,
        branch: VcsBranchResource | string | undefined,
        skip?: number,
        take?: number,
        triggerActionType?: TriggerActionType,
        triggerActionCategory?: TriggerActionCategory,
        runbooks?: string[],
        partialName?: string
    ): Promise<ResourceCollection<TriggerResource>> {
        return this.client.get<ResourceCollection<TriggerResource>>(project.Links["Triggers"], { skip, take, gitRef: GetBranchDetails(branch), triggerActionType, triggerActionCategory, runbooks, partialName });
    }

    orderChannels(project: ProjectResource) {
        return this.client.post(project.Links["OrderChannels"]);
    }

    getPulse(projects: ProjectResource[]) {
        const projectIds = projects
            .map((p) => {
                return p.Id;
            })
            .join(",");
        return this.client.get(this.client.getLink("ProjectPulse"), { projectIds });
    }

    getMetadata(project: ProjectResource): Promise<ProjectSettingsMetadata[]> {
        return this.client.get(project.Links["Metadata"], {});
    }

    getRunbooks(project: ProjectResource, args?: { skip?: number; take?: number }): Promise<ResourceCollection<NonVcsRunbookResource>> {
        return this.client.get<ResourceCollection<NonVcsRunbookResource>>(project.Links["Runbooks"], args);
    }

    summaries(): Promise<ProjectSummaryResource[]> {
        return this.client.get(this.client.getLink("ProjectsExperimentalSummaries"));
    }

    getSummary(project: ProjectResource, branch: VcsBranchResource | string | undefined): Promise<ProjectSummary> {
        return this.client.get(project.Links["Summary"], { gitRef: GetBranchDetails(branch) });
    }

    getBranch(project: ProjectResource, branch: BranchSpecifier): Promise<VcsBranchResource> {
        if (HasVcsProjectResourceLinks(project.Links) && HasVersionControlledPersistenceSettings(project.PersistenceSettings)) {
            const branchName: string = ShouldUseDefaultBranch(branch) ? project.PersistenceSettings.DefaultBranch : branch;
            return this.client.get(project.Links.Branches, { name: branchName });
        }
        throw new Error("Cannot retrieve branches from non-VCS projects");
    }

    getBranches(project: ProjectResource): Promise<ResourceCollection<VcsBranchResource>> {
        if (HasVcsProjectResourceLinks(project.Links)) {
            return this.client.get(project.Links.Branches);
        }
        throw new Error("Cannot retrieve branches from non-VCS projects");
    }

    searchBranches(project: ProjectResource, partialBranchName: string): Promise<ResourceCollection<VcsBranchResource>> {
        if (HasVcsProjectResourceLinks(project.Links)) {
            return this.client.get(project.Links.Branches, { searchByName: partialBranchName });
        }
        throw new Error("Cannot retrieve branches from non-VCS projects");
    }

    convertToVcs(project: ProjectResource, payload: ConvertProjectToVersionControlledCommand): Promise<ConvertProjectToVersionControlledResponse> {
        return this.client.post<ConvertProjectToVersionControlledResponse>(project.Links.ConvertToVcs, payload);
    }

    vcsCompatibilityReport(project: ProjectResource): Promise<VersionControlCompatibilityResponse> {
        return this.client.get(project.Links["VersionControlCompatibilityReport"]);
    }

    // TODO: @team-config-as-code - Our project needs a custom "Delete" link that does _not_ include the GitRef in order for us to
    // successfully hit the /projects/{id} DEL endpoint. For EAP, we're out of time and just hacking it into the frontend client.
    del(project: ProjectResource) {
        if (project.IsVersionControlled) {
            // Our "Self" link should currently include the GitRef. If so, and our last path does not look like our projectId, strip it.
            const selfLinkParts = project.Links.Self.split("/");
            if (selfLinkParts[selfLinkParts.length - 1] !== project.Id) {
                selfLinkParts.pop();
            }
            const selfLink = selfLinkParts.join("/");
            return this.client.del(selfLink).then((d) => this.notifySubscribersToDataModifications(project));
        } else {
            return this.client.del(project.Links.Self).then((d) => this.notifySubscribersToDataModifications(project));
        }
    }

    markAsStale(project: ProjectResource): Promise<void> {
        return this.client.post(project.Links["RepositoryModified"]);
    }
}

function ShouldUseDefaultBranch(branch: BranchSpecifier): branch is UseDefaultBranch {
    return typeof branch === "object";
}

function GetBranchDetails(branch: VcsBranchResource | string | undefined): string {
    if (typeof branch === "string" || branch instanceof String) {
        return branch as string;
    } else {
        return branch?.Name as string;
    }
}

export default ProjectRepository;
