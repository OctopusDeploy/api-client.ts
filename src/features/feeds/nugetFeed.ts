import type { FeedType } from "./feedType";
import type { SensitiveValue } from "../variables";
import type { RetryFeed } from "./retryFeed";

export interface NugetFeed extends RetryFeed {
    FeedType: FeedType.Nuget;
    EnhancedMode: boolean;
    FeedUri: string;
    Password?: SensitiveValue;
    Username?: string;
}
