import type { Client } from "../client";
import type { ProjectResource, VcsBranchResource } from "@octopusdeploy/message-contracts";
import { DeploymentProcessRepository } from "./deploymentProcessRepository";
import { VcsRunbookRepository } from "./vcsRunbookRepository";
import { BranchesRepository } from "./branchesRepository";
import DeploymentSettingsRepository from "./deploymentSettingsRepository";

class ProjectContextRepository {
    DeploymentProcesses: DeploymentProcessRepository;
    DeploymentSettings: DeploymentSettingsRepository;
    Runbooks: VcsRunbookRepository;
    Branches: BranchesRepository;

    constructor(client: Client, project: ProjectResource, branch: VcsBranchResource | undefined) {
        this.DeploymentProcesses = new DeploymentProcessRepository(client, project, branch);
        this.DeploymentSettings = new DeploymentSettingsRepository(client, project, branch);
        this.Runbooks = new VcsRunbookRepository(client, project, branch);
        this.Branches = new BranchesRepository(client);
    }
}

export default ProjectContextRepository;
