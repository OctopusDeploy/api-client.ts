import type {
    DynamicWorkerTypes,
    NewWorkerPoolResource,
    ResourceCollection,
    WorkerMachineResource,
    WorkerPoolsSummaryResource,
    WorkerPoolsSupportedTypes,
    WorkerPoolResource
} from "@octopusdeploy/message-contracts";
import type { Client } from "../client";
import BasicRepository from "./basicRepository";

class WorkerPoolRepository extends BasicRepository<WorkerPoolResource, NewWorkerPoolResource> {
    constructor(client: Client) {
        super("WorkerPools", client);
    }
    machines(workerPool: WorkerPoolResource, args?: Partial<WorkerPoolsMachinesArgs>): Promise<ResourceCollection<WorkerMachineResource>> {
        return this.client.get<ResourceCollection<WorkerMachineResource>>(workerPool.Links["Workers"], args);
    }
    summary(args?: Partial<WorkerPoolsSummaryArgs>) {
        return this.client.get<WorkerPoolsSummaryResource>(this.client.getLink("WorkerPoolsSummary"), args);
    }
    sort(order: string[]) {
        return this.client.put(this.client.getLink("WorkerPoolsSortOrder"), order);
    }
    getSupportedPoolTypes() {
        return this.client.get<WorkerPoolsSupportedTypes>(this.client.getLink("WorkerPoolsSupportedTypes"));
    }
    async getDynamicWorkerTypes() {
        const result = await this.client.get<DynamicWorkerTypes>(this.client.getLink("WorkerPoolsDynamicWorkerTypes"));
        return result.WorkerTypes;
    }
}

export type WorkerPoolsMachinesArgs = {
    skip: number;
    take: number;
    partialName: string | undefined;
    isDisabled: boolean;
    healthStatuses: string | null;
    commStyles: string | null;
    shellNames: string | null;
};

export type WorkerPoolsSummaryArgs = {
    ids: string;
    partialName: string;
    machinePartialName: string | undefined;
    isDisabled: boolean;
    healthStatuses: string;
    commStyles: string;
    hideEmptyWorkerPools: boolean;
    shellNames: string;
};

export default WorkerPoolRepository;
