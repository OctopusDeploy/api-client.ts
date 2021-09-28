import type { NewSpaceResource, SpaceResource, SpaceSearchResult } from "@octopusdeploy/message-contracts";
import { BasicRepository } from "./basicRepository";
import type { Client } from "../client";

export class SpaceRepository extends BasicRepository<SpaceResource, NewSpaceResource> {
    constructor(client: Client) {
        super("Spaces", client);
    }

    search(keyword: string) {
        return this.client.get<SpaceSearchResult[]>(this.client.getLink("SpaceSearch"), { id: this.client.spaceId, keyword: keyword });
    }
}