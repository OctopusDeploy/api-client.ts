import type { FeedType } from "./feedType";
import type { RetryFeed } from "./retryFeed";
import type { SensitiveValue } from "../variables";

export interface GitHubFeed extends RetryFeed {
    FeedType: FeedType.GitHub;
    FeedUri: string;
    Password?: SensitiveValue;
    Username?: string;
}
