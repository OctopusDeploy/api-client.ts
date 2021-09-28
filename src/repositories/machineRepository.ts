/* eslint-disable @typescript-eslint/no-explicit-any */

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
import BasicRepository from "./basicRepository";
import type { Client } from "../client";

export type ListMachinesArgs = {
    skip?: number;
    take?: number;
    partialName?: string;
    roles?: string;
    isDisabled?: boolean;
    healthStatuses?: string;
    commStyles?: string;
    tenantIds?: string;
    tenantTags?: string;
    environmentIds?: string;
    shellNames?: string;
};

class MachineRepository extends BasicRepository<DeploymentTargetResource, NewDeploymentTargetResource> {
    constructor(client: Client) {
        super("Machines", client);
    }
    list(args?: ListMachinesArgs): Promise<ResourceCollection<DeploymentTargetResource>> {
        return this.client.get(this.client.getLink("Machines"), args);
    }
    listByEnvironment(environment: EnvironmentResource) {
        return this.client.get(environment.Links["Machines"]);
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
    listByDeployment(deployment: DeploymentResource) {
        return this.client.get(this.client.getLink("Machines"), { deploymentId: deployment.Id, id: "all" });
    }
}

export default MachineRepository;
