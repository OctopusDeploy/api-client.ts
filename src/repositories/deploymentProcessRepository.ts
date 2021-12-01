import type {
    ChannelResource,
    DeploymentProcessOclResource,
    DeploymentProcessResource,
    ModifyDeploymentProcessCommand,
    NewDeploymentProcessResource,
    OctopusValidationResponse,
    ProjectResource,
    ReleaseResource,
    ReleaseTemplateResource,
    VcsBranchResource
} from "@octopusdeploy/message-contracts";
import type { AllArgs, ListArgs } from "./basicRepository";
import type { Client } from "../client";
import { ProjectScopedRepository } from "./projectScopedRepository";
import type ProjectRepository from "./projectRepository";
import type { RouteArgs } from "../resolver";
import { channel } from "diagnostics_channel";

type DeploymentProcessRepositoryListArgs = {
    skip?: number;
    take?: number;
} & RouteArgs;

type DeploymentProcessRepositoryAllArgs = {
    ids?: string[];
} & AllArgs;

export class DeploymentProcessRepository extends ProjectScopedRepository<DeploymentProcessResource, NewDeploymentProcessResource, DeploymentProcessRepositoryListArgs, DeploymentProcessRepositoryAllArgs> {
    readonly resourceLink = "DeploymentProcess";
    readonly collectionLink = "DeploymentProcesses";

    constructor(projectRepository: ProjectRepository, client: Client) {
        super(projectRepository, "DeploymentProcesses", client);
    }

    getForRelease(release: ReleaseResource): Promise<DeploymentProcessResource> {
        return this.client.get<DeploymentProcessResource>(this.client.getLink(this.collectionLink), { id: release.ProjectDeploymentProcessSnapshotId });
    }

    getTemplate(deploymentProcess: DeploymentProcessResource, channel?: ChannelResource, releaseId?: string) {
        return this.client.get<ReleaseTemplateResource>(deploymentProcess.Links["Template"], { channel: channel?.Id, releaseId });
    }

    modify(deploymentProcess: ModifyDeploymentProcessCommand): Promise<DeploymentProcessResource> {
        return this.client.update(deploymentProcess.Links.Self, deploymentProcess);
    }

    validate(deploymentProcess: DeploymentProcessResource) {
        return this.client.post<OctopusValidationResponse>(deploymentProcess.Links["Validation"], { ...deploymentProcess });
    }

    getOcl(deploymentProcess: DeploymentProcessResource) {
        return this.client.get<DeploymentProcessOclResource>(deploymentProcess.Links["RawOcl"]);
    }

    modifyOcl(deploymentProcess: DeploymentProcessResource, command: DeploymentProcessOclResource) {
        return this.client.update<DeploymentProcessOclResource>(deploymentProcess.Links["RawOcl"], command);
    }
}