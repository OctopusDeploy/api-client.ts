import BasicRepository from "./basicRepository";
import type { ProjectGroupResource } from "@octopusdeploy/message-contracts";
import type { Client } from "../client";

class ProjectGroupRepository extends BasicRepository<ProjectGroupResource, ProjectGroupResource> {
    constructor(client: Client) {
        super("ProjectGroups", client);
    }
}

export default ProjectGroupRepository;
