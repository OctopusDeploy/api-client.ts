import type { ResourceWithId } from "@octopusdeploy/message-contracts";
import type { GlobalAndSpaceRootLinks } from "../client";
import type { Client } from "../client";

export class ConfigurationRepository<TResource extends ResourceWithId> {
    protected client: Client;
    private configurationLinkName: GlobalAndSpaceRootLinks;

    constructor(configurationLinkName: GlobalAndSpaceRootLinks, client: Client) {
        this.configurationLinkName = configurationLinkName;
        this.client = client;
    }

    get(): Promise<TResource> {
        return this.client.get<TResource>(this.client.getLink(this.configurationLinkName));
    }

    modify(resource: TResource): Promise<TResource> {
        return this.client.update<TResource>(resource.Links["Self"], resource);
    }
}