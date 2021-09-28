import { BasicRepository } from "./basicRepository";
import type { ProjectGroupResource } from "@octopusdeploy/message-contracts";
import type { Client } from "../client";

export class ProjectGroupRepository extends BasicRepository<ProjectGroupResource, ProjectGroupResource> {
    constructor(client: Client) {
        super("ProjectGroups", client);
    }
}