/* eslint-disable @typescript-eslint/no-explicit-any */

import { BasicRepository } from "./basicRepository";
import type { Client } from "../client";
import type { ScheduledTaskDetailsResource } from "@octopusdeploy/message-contracts";

interface DetailsArgs {
    tail: number;
    verbose: boolean;
}

export class SchedulerRepository extends BasicRepository<any, any> {
    constructor(client: Client) {
        super("Scheduler", client);
    }

    getDetails(name: string, options?: DetailsArgs) {
        const args = { ...options, name };
        return this.client.get<ScheduledTaskDetailsResource>(this.client.getLink("Scheduler"), args);
    }
}