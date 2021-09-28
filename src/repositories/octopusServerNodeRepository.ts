import type {
    OctopusServerClusterSummaryResource,
    OctopusServerNodeDetailsResource,
    OctopusServerNodeResource,
    ResourceCollection,
    OctopusServerNodeSummaryResource
} from "@octopusdeploy/message-contracts";
import { BasicRepository } from "./basicRepository";
import type { Client } from "../client";

export class OctopusServerNodeRepository extends BasicRepository<OctopusServerNodeResource, OctopusServerNodeResource> {
    constructor(client: Client) {
        super("OctopusServerNodes", client);
    }

    del(resource: OctopusServerNodeSummaryResource) {
        return this.client.del(resource.Links.Node).then((d) => this.notifySubscribersToDataModifications(resource));
    }

    //technically deprecated, as its not called from the UI.
    //introduced in 2019.1.0, the code that called it got changed soon after
    details(node: OctopusServerNodeResource): Promise<ResourceCollection<OctopusServerNodeDetailsResource>> {
        return this.client.get(node.Links["Details"]);
    }

    summary(): Promise<OctopusServerClusterSummaryResource> {
        return this.client.get(this.client.getLink("OctopusServerClusterSummary"));
    }
}