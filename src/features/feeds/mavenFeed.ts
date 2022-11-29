import type { FeedType } from "./feedType";
import type { SensitiveValue } from "../variables";
import type { RetryFeed } from "./retryFeed";

export interface MavenFeed extends RetryFeed {
    FeedType: FeedType.Maven;
    FeedUri: string;
    Password?: SensitiveValue;
    Username?: string;
}
