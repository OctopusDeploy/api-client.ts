import type { TagSetResource } from "@octopusdeploy/message-contracts";
import { BasicRepository } from "./basicRepository";
import type { Client } from "../client";

class TagSetRepository extends BasicRepository<TagSetResource, TagSetResource> {
    constructor(client: Client) {
        super("TagSets", client);
    }
    sort(ids: string[]) {
        return this.client.put(this.client.getLink("TagSetSortOrder"), ids);
    }
}

export default TagSetRepository;
