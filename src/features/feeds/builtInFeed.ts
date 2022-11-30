import type { FeedType } from "./feedType";
import { SpaceScopedResource } from "../../spaceScopedResource";
import { NamedResource } from "../../namedResource";

export interface BuiltInFeed extends SpaceScopedResource, NamedResource {
    FeedType: FeedType.BuiltIn;
    DeleteUnreleasedPackagesAfterDays?: number;
    IsBuiltInRepoSyncEnabled: boolean;
}
