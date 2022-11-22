import type { Client } from "../../client";
import { ListArgsV2, NewTagSet, SpaceScopedBasicRepositoryV2, TagSet } from "../..";

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
