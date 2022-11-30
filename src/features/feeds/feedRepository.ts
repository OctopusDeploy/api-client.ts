import { Client, spaceScopedRoutePrefix } from "../..";
import { ListArgs } from "../basicRepository";
import { SpaceScopedBasicRepository } from "../spaceScopedBasicRepository";
import { Feed } from "./feed";
import { FeedType } from "./feedType";

type FeedListArgs = {
    ids?: string[];
    partialName?: string;
    feedType?: FeedType;
} & ListArgs;

export class FeedRepository extends SpaceScopedBasicRepository<Feed, Feed, FeedListArgs> {
    constructor(client: Client, spaceName: string) {
        super(client, spaceName, `${spaceScopedRoutePrefix}/feeds{/id}{?skip,take,ids,partialName,feedType}`);
    }
}
