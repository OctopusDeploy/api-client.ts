import type { Client } from "../../client";
import { ListArgs, SpaceScopedBasicRepository } from "..";
import { NewTagSet, TagSet } from "./tagSet";

type TagSetRepositoryListArgs = {
    ids?: string[];
    partialName?: string;
} & ListArgs;

export class TagSetRepository extends SpaceScopedBasicRepository<TagSet, NewTagSet, TagSetRepositoryListArgs> {
    constructor(client: Client, spaceName: string) {
        super(client, spaceName, "~/api/{spaceId}/tagsets{/id}{?skip,take,ids,partialName}");
    }

    sort(ids: string[]) {
        return this.client.doUpdate("~/api/{spaceId}/tagsets/sortorder", ids, { spaceName: this.spaceName });
    }
}
