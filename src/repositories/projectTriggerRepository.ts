import type { NewTriggerResource, TriggerResource } from "@octopusdeploy/message-contracts";
import { BasicRepository } from "./basicRepository";
import type { Client } from "../client";

export class ProjectTriggerRepository extends BasicRepository<TriggerResource, NewTriggerResource> {
    constructor(client: Client) {
        super("ProjectTriggers", client);
    }
}