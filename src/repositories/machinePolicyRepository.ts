/* eslint-disable @typescript-eslint/no-explicit-any */

import type {
    DeploymentTargetResource,
    MachinePolicyResource,
    ResourceCollection,
    WorkerMachineResource
} from "@octopusdeploy/message-contracts";
import BasicRepository from "./basicRepository";
import type { Client } from "../client";

class MachinePolicyRepository extends BasicRepository<MachinePolicyResource, any> {
    constructor(client: Client) {
        super("MachinePolicies", client);
    }
    getTemplate(): Promise<MachinePolicyResource> {
        return this.client.get(this.client.getLink("MachinePolicyTemplate"));
    }
    getMachines(machinePolicy: MachinePolicyResource): Promise<ResourceCollection<DeploymentTargetResource>> {
        return this.client.get(machinePolicy.Links["Machines"]);
    }
    getWorkers(machinePolicy: MachinePolicyResource): Promise<ResourceCollection<WorkerMachineResource>> {
        return this.client.get(machinePolicy.Links["Workers"]);
    }
}

export default MachinePolicyRepository;
