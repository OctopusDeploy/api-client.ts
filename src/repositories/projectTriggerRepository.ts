import BasicRepository from "./basicRepository";
import type { Client } from "../client";
import type { NewTriggerResource, TriggerResource } from "@octopusdeploy/message-contracts";

class ProjectTriggerRepository extends BasicRepository<TriggerResource, NewTriggerResource> {
    constructor(client: Client) {
        super("ProjectTriggers", client);
    }
}

export default ProjectTriggerRepository;
