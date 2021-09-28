import type { InterruptionResource } from "@octopusdeploy/message-contracts";
import { BasicRepository, ListArgs } from "./basicRepository";
import type { Client } from "../client";

type InterruptionListArgs = {
    regarding?: string;
    pendingOnly?: boolean;
} & ListArgs;

export class InterruptionRepository extends BasicRepository<InterruptionResource, InterruptionResource, InterruptionListArgs> {
    constructor(client: Client) {
        super("Interruptions", client);
    }

    submit(interruption: InterruptionResource, result: any) {
        return this.client.post(interruption.Links["Submit"], result);
    }

    takeResponsibility(interruption: InterruptionResource) {
        return this.client.put(interruption.Links["Responsible"]);
    }
}