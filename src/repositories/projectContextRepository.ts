import type { ProjectResource, VcsBranchResource } from "@octopusdeploy/message-contracts";
import { BranchesRepository } from "./branchesRepository";
import type { Client } from "../client";
import { DeploymentProcessRepository } from "./deploymentProcessRepository";
import { DeploymentSettingsRepository } from "./deploymentSettingsRepository";
import { VcsRunbookRepository } from "./vcsRunbookRepository";

export class ProjectContextRepository {
    Branches: BranchesRepository;
    DeploymentProcesses: DeploymentProcessRepository;
    DeploymentSettings: DeploymentSettingsRepository;
    Runbooks: VcsRunbookRepository;

    constructor(client: Client, project: ProjectResource, branch: VcsBranchResource | undefined) {
        this.DeploymentProcesses = new DeploymentProcessRepository(client, project, branch);
        this.DeploymentSettings = new DeploymentSettingsRepository(client, project, branch);
        this.Runbooks = new VcsRunbookRepository(client, project, branch);
        this.Branches = new BranchesRepository(client);
    }
}