import { NamedResource } from "../namedResource";
import { SpaceScopedResource } from "../spaceScopedResource";

export interface RetryFeed extends SpaceScopedResource, NamedResource {
    DownloadAttempts: number;
    DownloadRetryBackoffSeconds: number;
}
