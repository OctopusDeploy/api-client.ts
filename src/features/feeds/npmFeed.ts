import type { FeedType } from "./feedType";
import type { SensitiveValue } from "../variables";
import type { RetryFeed } from "./retryFeed";

export interface NpmFeed extends RetryFeed {
    FeedType: FeedType.Npm;
    FeedUri: string;
    Password?: SensitiveValue;
    Username?: string;
}
