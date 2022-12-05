import { NamedResource } from "../../namedResource";
import { SpaceScopedResource } from "../../spaceScopedResource";
import type { FeedType } from "./feedType";

export interface OctopusProjectFeed extends SpaceScopedResource, NamedResource {
    FeedType: FeedType.OctopusProject;
}
