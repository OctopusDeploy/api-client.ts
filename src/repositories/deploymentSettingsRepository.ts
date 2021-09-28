import type {
    DeploymentSettingsOclResource,
    DeploymentSettingsResource,
    ModifyDeploymentSettingsCommand,
    ModifyDeploymentSettingsOclCommand,
    ProjectResource,
    VcsBranchResource
} from "@octopusdeploy/message-contracts";
import type { Client } from "../client";

export class DeploymentSettingsRepository {
    readonly resourceLink = "DeploymentSettings";

    constructor(private readonly client: Client, private readonly project: ProjectResource, private readonly branch: VcsBranchResource | undefined) {
        this.client = client;
    }

    get(): Promise<DeploymentSettingsResource> {
        if (this.project.IsVersionControlled && this.branch !== undefined) {
            return this.client.get(this.branch.Links[this.resourceLink]);
        }

        return this.client.get(this.project.Links[this.resourceLink]);
    }

    modify(deploymentSettings: ModifyDeploymentSettingsCommand): Promise<DeploymentSettingsResource> {
        return this.client.update(deploymentSettings.Links.Self, deploymentSettings);
    }

    getOcl(deploymentSettings: DeploymentSettingsResource) {
        return this.client.get<DeploymentSettingsOclResource>(deploymentSettings.Links["RawOcl"]);
    }

    modifyOcl(deploymentSettings: DeploymentSettingsResource, command: ModifyDeploymentSettingsOclCommand) {
        return this.client.update<DeploymentSettingsOclResource>(deploymentSettings.Links["RawOcl"], command);
    }
}

export default DeploymentSettingsRepository;
