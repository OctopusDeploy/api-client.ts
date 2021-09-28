import type {
    ResourceCollection,
    MachineConnectionStatus,
    MachineResource,
    NewWorkerMachineResource,
    WorkerMachineResource
} from "@octopusdeploy/message-contracts";
import BasicRepository from "./basicRepository";
import type { Client } from "../client";

export type ListWorkerArgs = {
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
    workerPoolIds?: string;
};

export class WorkerRepository extends BasicRepository<WorkerMachineResource, NewWorkerMachineResource> {
    constructor(client: Client) {
        super("Workers", client);
    }

    discover(host: string, port: number, type: any, proxyId: string | undefined): Promise<WorkerMachineResource> {
        return proxyId ? this.client.get<WorkerMachineResource>(this.client.getLink("DiscoverWorker"), { host, port, type, proxyId }) : this.client.get<WorkerMachineResource>(this.client.getLink("DiscoverWorker"), { host, port, type });
    }

    getConnectionStatus(machine: MachineResource): Promise<MachineConnectionStatus> {
        return this.client.get<MachineConnectionStatus>(machine.Links["Connection"]);
    }

    list(args?: ListWorkerArgs): Promise<ResourceCollection<WorkerMachineResource>> {
        return this.client.get(this.client.getLink("Workers"), args);
    }
}