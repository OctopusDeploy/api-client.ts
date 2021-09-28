import type { LifecycleResource, ProjectResource } from "@octopusdeploy/message-contracts";
import BasicRepository from "./basicRepository";
import type { Client } from "../client";

class LifecycleRepository extends BasicRepository<LifecycleResource, LifecycleResource> {
    constructor(client: Client) {
        super("Lifecycles", client);
    }
    preview(lifecycle: LifecycleResource): Promise<LifecycleResource> {
        return this.client.get(lifecycle.Links["Preview"]);
    }
    projects(lifecycle: LifecycleResource) {
        return this.client.get<ProjectResource[]>(lifecycle.Links["Projects"]);
    }
}

export default LifecycleRepository;
