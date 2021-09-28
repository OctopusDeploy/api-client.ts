import type {
    AccountTestTaskArguments,
    ActionProperties,
    ActionTemplateResource,
    AdHocScriptTaskArguments,
    ConfigureLetsEncryptArguments,
    EnvironmentResource,
    HealthCheckTaskArguments,
    MachineResource,
    NewTaskResource,
    ResourceCollection,
    ScriptingLanguage,
    SynchronizeBuiltInPackageRepositoryIndexTaskArguments,
    SynchronizeCommunityActionTemplatesTaskArguments,
    SystemIntegrityCheckTaskArguments,
    TaskDetailsResource,
    TaskResource,
    TaskTypeResource,
    TestEmailTaskArguments,
    UpdateCalamariTaskArguments,
    UpgradeTaskArguments,
    WorkerPoolResource,
} from "@octopusdeploy/message-contracts";
import { TaskName, TaskRestrictedTo } from "@octopusdeploy/message-contracts";
import type { ListArgs } from "./basicRepository";
import type { Client } from "../client";
import { chunk, flatMap } from "lodash";
import { MixedScopeBaseRepository } from "./mixedScopeBaseRepository";

interface TaskListArgs extends ListArgs {
    name?: string;
    node?: string;
    tenant?: string;
    environment?: string;
    project?: string;
    taskName?: string;
    states?: string;
    running?: boolean;
    active?: boolean;
    hasPendingInterruptions?: boolean;
    hasWarningsOrErrors?: boolean;
    ids?: string | string[];
    includeSystem?: boolean;
}

export interface AdHocScriptTargetArguments {
    EnvironmentIds: string[];
    MachineIds: string[];
    TargetRoles: string[];
    TenantIds: string[];
    WorkerIds: string[];
    WorkerPoolIds: string[];
}

type TaskDetailsArgs = {
    verbose: boolean;
    tail: number | null;
};

export interface StatsResourceCollection extends ResourceCollection<TaskResource<any>> {
    TotalCounts: { [state: string]: number };
}

export class TaskRepository extends MixedScopeBaseRepository<TaskResource<any>, NewTaskResource<any>, TaskListArgs> {
    constructor(client: Client) {
        super("Tasks", client);
    }

    createPerformIntegrityCheckTask() {
        return this.createSystemTask<SystemIntegrityCheckTaskArguments>(TaskName.SystemIntegrityCheck, "Check System Integrity", {});
    }

    createSynchronizeCommunityStepTemplatesTask() {
        return this.createSystemTask<SynchronizeCommunityActionTemplatesTaskArguments>(TaskName.SyncCommunityActionTemplates, "Synchronize Community Step Templates", {});
    }

    createConfigureLetsEncryptTask(letsEncryptArguments: ConfigureLetsEncryptArguments) {
        return this.createSystemTask<ConfigureLetsEncryptArguments>(TaskName.ConfigureLetsEncrypt, "Configure Let's Encrypt SSL Certificate", letsEncryptArguments);
    }

    createRenewLetsEncryptTask(letsEncryptArguments: ConfigureLetsEncryptArguments) {
        return this.createSystemTask<ConfigureLetsEncryptArguments>(TaskName.ConfigureLetsEncrypt, "Renew Let's Encrypt SSL Certificate", letsEncryptArguments);
    }

    createSendTestEmailTask(emailAddress: string) {
        return this.createSystemTask<TestEmailTaskArguments>(TaskName.TestEmail, "Send test email", { EmailAddress: emailAddress });
    }

    createUpgradeTentaclesTask() {
        return this.createSpaceScopedTask<UpgradeTaskArguments>(TaskName.Upgrade, "Upgrade Tentacles", {});
    }

    createUpgradeTentaclesTaskForEnvironment(environment: EnvironmentResource | undefined, machineIds: string[]) {
        const description = environment ? `Upgrade Tentacles in ${environment.Name}` : "Upgrade Tentacles";
        const upgradeTaskArguments: UpgradeTaskArguments = {
            RestrictedTo: TaskRestrictedTo.DeploymentTargets,
            MachineIds: machineIds,
            ...(environment ? { EnvironmentId: environment.Id } : {}),
        };
        return this.createSpaceScopedTask<UpgradeTaskArguments>(TaskName.Upgrade, description, upgradeTaskArguments);
    }

    createUpgradeTentacleOnMachineTask(machine: MachineResource) {
        if (machine.Id !== null && machine.Id !== undefined) {
            return this.createSpaceScopedTask<UpgradeTaskArguments>(TaskName.Upgrade, `Upgrade Tentacle on ${machine.Name}`, { MachineIds: [machine.Id] });
        }
    }

    createUpgradeTentacleOnWorkerPoolTask(workerPool: WorkerPoolResource | undefined, machineIds: string[]) {
        const description = workerPool ? `Upgrade Tentacles in ${workerPool.Name}` : "Upgrade Tentacles";
        const upgradeTaskArguments: UpgradeTaskArguments = {
            RestrictedTo: TaskRestrictedTo.Workers,
            MachineIds: machineIds,
            ...(workerPool ? { WorkerPoolId: workerPool.Id } : {}),
        };
        return this.createSpaceScopedTask<UpgradeTaskArguments>(TaskName.Upgrade, description, upgradeTaskArguments);
    }

    createUpgradeTentaclesTaskRestrictedTo(restrictedTo: TaskRestrictedTo, MachineIds: string[]) {
        return this.createSpaceScopedTask<UpgradeTaskArguments>(TaskName.Upgrade, "Upgrade Tentacles", { RestrictedTo: restrictedTo, MachineIds });
    }

    createPerformHealthCheckTaskForEnvironment(environment: EnvironmentResource | undefined, machineIds: string[]) {
        const description = environment ? `Check deployment target health in ${environment.Name}` : "Check deployment target health";
        const healthCheckArguments: HealthCheckTaskArguments = {
            Timeout: "00:05:00",
            OnlyTestConnection: false,
            RestrictedTo: TaskRestrictedTo.DeploymentTargets,
            MachineIds: machineIds,
            ...(environment ? { EnvironmentId: environment.Id } : {}),
        };
        return this.createSpaceScopedTask<HealthCheckTaskArguments>(TaskName.Health, description, healthCheckArguments);
    }

    createPerformHealthCheckTaskForWorkerPool(workerPool: WorkerPoolResource | undefined, machineIds: string[]) {
        const description = workerPool ? `Check worker health in ${workerPool.Name}` : "Check worker health";
        const healthCheckArguments: HealthCheckTaskArguments = {
            Timeout: "00:05:00",
            OnlyTestConnection: false,
            RestrictedTo: TaskRestrictedTo.Workers,
            MachineIds: machineIds,
            ...(workerPool ? { WorkerPoolId: workerPool.Id } : {}),
        };
        return this.createSpaceScopedTask<HealthCheckTaskArguments>(TaskName.Health, description, healthCheckArguments);
    }

    createHealthCheckTaskForMachine(machine: MachineResource) {
        if (machine.Id !== null && machine.Id !== undefined) {
            return this.createSpaceScopedTask<HealthCheckTaskArguments>(TaskName.Health, `Check ${machine.Name} health`, {
                Timeout: "00:05:00",
                MachineIds: [machine.Id],
                OnlyTestConnection: false,
            });
        }
    }

    createHealthCheckTaskRestrictedTo(restrictedTo: TaskRestrictedTo, machineIds: string[]) {
        const description = restrictedTo === TaskRestrictedTo.Workers ? "Check worker health" : "Check deployment target health";
        return this.createSpaceScopedTask<HealthCheckTaskArguments>(TaskName.Health, description, {
            Timeout: "00:05:00",
            OnlyTestConnection: false,
            RestrictedTo: restrictedTo,
            MachineIds: machineIds,
        });
    }

    createUpdateCalamariOnTargetsTask(deploymentTargetIds: string[]) {
        return this.createSpaceScopedTask<UpdateCalamariTaskArguments>(TaskName.UpdateCalamari, "Update Calamari on Deployment Targets", { MachineIds: deploymentTargetIds });
    }

    createUpdateCalamariOnWorkersTask(workerIds: string[]) {
        return this.createSpaceScopedTask<UpdateCalamariTaskArguments>(TaskName.UpdateCalamari, "Upgrade Calamari on Workers", { MachineIds: workerIds });
    }

    createUpdateCalamariOnTargetTask(machine: MachineResource) {
        if (machine.Id !== null && machine.Id !== undefined) {
            return this.createSpaceScopedTask<UpdateCalamariTaskArguments>(TaskName.UpdateCalamari, `Update Calamari on ${machine.Name}`, { MachineIds: [machine.Id] });
        }
    }

    createSynchronizeBuiltInPackageRepositoryTask() {
        return this.createSpaceScopedTask<SynchronizeBuiltInPackageRepositoryIndexTaskArguments>(TaskName.SynchronizeBuiltInPackageRepositoryIndex, "Re-index built-in package repository", {});
    }

    createTestAzureAccountTask(azureAccountId: string) {
        return this.createSpaceScopedTask<AccountTestTaskArguments>(TaskName.TestAccount, "Test Azure account", { AccountId: azureAccountId });
    }

    createTestAwsAccountTask(awsAccountId: string) {
        return this.createSpaceScopedTask<AccountTestTaskArguments>(TaskName.TestAccount, "Test Amazon Web Services account", { AccountId: awsAccountId });
    }

    createTestGoogleCloudAccountTask(googleCloudAccountId: string) {
        return this.createSpaceScopedTask<AccountTestTaskArguments>(TaskName.TestAccount, "Test Google Cloud account", { AccountId: googleCloudAccountId });
    }

    createRunActionTemplateTask(targets: AdHocScriptTargetArguments, properties: ActionProperties, template: ActionTemplateResource) {
        const runActionTemplateArguments: AdHocScriptTaskArguments = {
            ...targets,
            Properties: properties,
            ActionTemplateId: template.Id,
        };
        return this.createSpaceScopedTask<AdHocScriptTaskArguments>(TaskName.AdHocScript, "Run step template: " + template.Name, runActionTemplateArguments);
    }

    createScriptConsoleTask(targets: AdHocScriptTargetArguments, syntax: ScriptingLanguage, scriptBody: string) {
        const scriptConsoleArguments: AdHocScriptTaskArguments = {
            ...targets,
            Syntax: syntax,
            ScriptBody: scriptBody,
        };
        return this.createSpaceScopedTask<AdHocScriptTaskArguments>(TaskName.AdHocScript, "Script run from management console", scriptConsoleArguments);
    }

    create(resource: NewTaskResource<any>, args?: {}): Promise<TaskResource<any>> {
        throw new Error("Can't create generic tasks. Instead, concrete task factory methods on the TaskRepository should be used to create tasks");
    }

    details(task: TaskResource<any>, args: TaskDetailsArgs) {
        return this.client.get<TaskDetailsResource>(task.Links["Details"], args);
    }

    getQueuedBehind(task: TaskResource<any>, args?: { skip?: number; take?: number }): Promise<ResourceCollection<TaskResource<any>>> {
        const combinedParameters = this.extend(this.spacePartitionParameters(), args);

        return this.client.get(task.Links["QueuedBehind"], combinedParameters);
    }

    getRaw(task: TaskResource<any>) {
        return this.client.getRaw(task.Links["Raw"]);
    }

    taskTypes(): Promise<TaskTypeResource[]> {
        return this.client.get<TaskTypeResource[]>(this.client.getLink("TaskTypes"), {});
    }

    filter(args: any): Promise<ResourceCollection<TaskResource<any>>> {
        const combinedParameters = this.extend(this.spacePartitionParameters(), args);
        return this.client.get<ResourceCollection<TaskResource<any>>>(this.client.getLink("Tasks"), combinedParameters);
    }

    rerun(task: TaskResource<any>): Promise<TaskResource<any>> {
        return this.client.post(task.Links["Rerun"]);
    }

    cancel(task: TaskResource<any>) {
        return this.client.post(task.Links["Cancel"]);
    }

    changeState(task: TaskResource<any>, state: any, reason: any): Promise<TaskResource<any>> {
        return this.client.post(task.Links["State"], { state, reason });
    }

    list(args?: TaskListArgs): Promise<StatsResourceCollection> {
        return super.list(args) as Promise<StatsResourceCollection>;
    }

    byIds(ids: string[]): Promise<Array<TaskResource<any>>> {
        const batchSize = 300;
        const idArrays = chunk(ids, batchSize);
        const promises: Array<Promise<StatsResourceCollection>> = idArrays.map((i) => {
            return this.list({ ids: i, take: batchSize });
        });
        return Promise.all(promises).then((result) => flatMap(result, (c) => c.Items));
    }

    private createSystemTask<TaskArguments>(name: TaskName, description: string, taskArguments: TaskArguments): Promise<TaskResource<TaskArguments>> {
        return super.create({
            Name: name,
            Description: description,
            Arguments: taskArguments,
            SpaceId: null,
        });
    }

    private createSpaceScopedTask<TaskArguments>(name: TaskName, description: string, taskArguments: TaskArguments): Promise<TaskResource<TaskArguments>> {
        if (!this.client.spaceId) {
            throw new Error("Tried to create a space scoped task without being in the context of a space");
        }
        return super.create({
            Name: name,
            Description: description,
            Arguments: taskArguments,
            SpaceId: this.client.spaceId,
        });
    }
}