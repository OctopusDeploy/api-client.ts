import type {
    DeploymentResource,
    DeploymentTargetResource,
    EnvironmentResource,
    MachineConnectionStatus,
    MachineResource,
    NewDeploymentTargetResource,
    ResourceCollection,
    TaskResource
} from "@octopusdeploy/message-contracts";
import { DeploymentTargetTaskType } from "@octopusdeploy/message-contracts";
import { BasicRepository, ListArgs } from "./basicRepository";
import type { Client } from "../client";

export type ListMachinesArgs = {
    commStyles?: string;
    environmentIds?: string;
    healthStatuses?: string;
    isDisabled?: boolean;
    partialName?: string;
    roles?: string;
    shellNames?: string;
    tenantIds?: string;
    tenantTags?: string;
} & ListArgs;

export class MachineRepository extends BasicRepository<DeploymentTargetResource, NewDeploymentTargetResource> {
    constructor(client: Client) {
        super("Machines", client);
    }

    discover(host: string, port: number, type: any, proxyId: string | undefined): Promise<DeploymentTargetResource> {
        return proxyId ? this.client.get<DeploymentTargetResource>(this.client.getLink("DiscoverMachine"), { host, port, type, proxyId }) : this.client.get<DeploymentTargetResource>(this.client.getLink("DiscoverMachine"), { host, port, type });
    }

    getConnectionStatus(machine: MachineResource): Promise<MachineConnectionStatus> {
        return this.client.get<MachineConnectionStatus>(machine.Links["Connection"]);
    }

    getDeployments(machine: DeploymentTargetResource, options: any): Promise<ResourceCollection<TaskResource<any>>> {
        return this.client.get<ResourceCollection<TaskResource<any>>>(machine.Links["TasksTemplate"], { ...options, type: DeploymentTargetTaskType.Deployment });
    }

    getRunbookRuns(machine: DeploymentTargetResource, options: any): Promise<ResourceCollection<TaskResource<any>>> {
        return this.client.get<ResourceCollection<TaskResource<any>>>(machine.Links["TasksTemplate"], { ...options, type: DeploymentTargetTaskType.RunbookRun });
    }

    hosted() {
        const allArgs = { id: "hosted" };
        return this.client.get(this.client.getLink("Machines"), allArgs);
    }

    list(args?: ListMachinesArgs): Promise<ResourceCollection<DeploymentTargetResource>> {
        return this.client.get(this.client.getLink("Machines"), args);
    }

    listByDeployment(deployment: DeploymentResource) {
        return this.client.get(this.client.getLink("Machines"), { deploymentId: deployment.Id, id: "all" });
    }

    listByEnvironment(environment: EnvironmentResource) {
        return this.client.get(environment.Links["Machines"]);
    }
}