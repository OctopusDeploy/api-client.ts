import { Resource } from "../resource";
import type { FeedType } from "./feedType";
import type { SensitiveValue } from "../variables";
import { SpaceScopedResource } from "../spaceScopedResource";
import { NamedResource } from "../namedResource";

export interface HelmFeed extends SpaceScopedResource, NamedResource {
    FeedType: FeedType.Helm;
    FeedUri: string;
    Password?: SensitiveValue;
    Username?: string;
}
