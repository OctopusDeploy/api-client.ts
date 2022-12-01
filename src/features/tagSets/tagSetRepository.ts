import type { Client } from "../../client";
import { NewTagSet, TagSet } from "./tagSet";
import { spaceScopedRoutePrefix } from "../../spaceScopedRoutePrefix";
import { ListArgs } from "../basicRepository";
import { SpaceScopedBasicRepository } from "../spaceScopedBasicRepository";

type TagSetRepositoryListArgs = {
    ids?: string[];
    partialName?: string;
} & ListArgs;

export class TagSetRepository extends SpaceScopedBasicRepository<TagSet, NewTagSet, TagSetRepositoryListArgs> {
    constructor(client: Client, spaceName: string) {
        super(client, spaceName, `${spaceScopedRoutePrefix}/tagsets{/id}{?skip,take,ids,partialName}`);
    }

    sort(ids: string[]) {
        return this.client.doUpdate(`${spaceScopedRoutePrefix}/tagsets/sortorder`, ids, { spaceName: this.spaceName });
    }
}
