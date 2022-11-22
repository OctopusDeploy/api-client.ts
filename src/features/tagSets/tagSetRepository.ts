import type { Client } from "../../client";
import { ListArgsV2, SpaceScopedBasicRepositoryV2 } from "..";
import { NewTagSet, TagSet } from "./tagSet";

type TagSetRepositoryListArgs = {
    ids?: string[];
    partialName?: string;
} & ListArgsV2;

export class TagSetRepository extends SpaceScopedBasicRepositoryV2<TagSet, NewTagSet, TagSetRepositoryListArgs> {
    constructor(client: Client, spaceName: string) {
        super(client, spaceName, "~/api/{spaceId}/tagsets{/id}{?skip,take,ids,partialName}");
    }

    sort(ids: string[]) {
        return this.client.doUpdate("~/api/{spaceId}/tagsets/sortorder", ids, { spaceName: this.spaceName });
    }
}
