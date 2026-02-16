import type { FeedType } from "./feedType";
import type { SensitiveValue } from "../variables";
import { SpaceScopedResource } from "../../spaceScopedResource";
import { NamedResource } from "../../namedResource";
import type { RetryFeed } from "./retryFeed";

export interface GoogleOidcAuthentication {
    Audience?: string;
    SubjectKeys: string[];
}

export interface GcsStorageFeed extends SpaceScopedResource, NamedResource, RetryFeed {
    FeedType: FeedType.GcsStorage;
    Name: string;
    UseServiceAccountKey: boolean;
    ServiceAccountJsonKey?: SensitiveValue;
    Project?: string;
    OidcAuthentication?: GoogleOidcAuthentication;
}
