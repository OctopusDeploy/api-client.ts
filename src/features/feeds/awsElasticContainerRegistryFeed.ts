import type { FeedType } from "./feedType";
import type { RetryFeed } from "./retryFeed";
import type { SensitiveValue } from "../variables";

export interface AwsElasticContainerRegistryFeed extends RetryFeed {
    AccessKey: string;
    FeedType: FeedType.AwsElasticContainerRegistry;
    FeedUri: string;
    Name: string;
    Region: string;
    SecretKey: SensitiveValue;
}
