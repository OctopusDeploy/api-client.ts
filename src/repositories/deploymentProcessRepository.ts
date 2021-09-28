import type {
    DeploymentProcessOclResource,
    DeploymentProcessResource,
    ModifyDeploymentProcessCommand,
    OctopusValidationResponse,
    ProjectResource,
    ReleaseResource,
    ReleaseTemplateResource,
    VcsBranchResource
} from "@octopusdeploy/message-contracts";
import type { Client } from "../client";

export class DeploymentProcessRepository {
    readonly resourceLink = "DeploymentProcess";
    readonly collectionLink = "DeploymentProcesses";

    constructor(private readonly client: Client, private readonly project: ProjectResource, private readonly branch: VcsBranchResource | undefined) {
        this.client = client;
    }

    get(): Promise<DeploymentProcessResource> {
        if (this.project.IsVersionControlled && this.branch !== undefined) {
            return this.client.get(this.branch.Links[this.resourceLink]);
        }

        return this.client.get(this.project.Links[this.resourceLink]);
    }

    getForRelease(release: ReleaseResource): Promise<DeploymentProcessResource> {
        return this.client.get<DeploymentProcessResource>(this.client.getLink(this.collectionLink), { id: release.ProjectDeploymentProcessSnapshotId });
    }

    getTemplate(deploymentProcess: DeploymentProcessResource, channelId: string, releaseId: string) {
        return this.client.get<ReleaseTemplateResource>(deploymentProcess.Links["Template"], { channel: channelId, releaseId });
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

export default DeploymentProcessRepository;
