/* eslint-disable @typescript-eslint/consistent-type-assertions */

import type { AwsElasticContainerRegistryFeed } from "./awsElasticContainerRegistryFeed";
import type { BuiltInFeed } from "./builtInFeed";
import type { DockerFeed } from "./dockerFeed";
import { FeedType } from "./feedType";
import type { GitHubFeed } from "./gitHubFeed";
import type { HelmFeed } from "./helmFeed";
import type { MavenFeed } from "./mavenFeed";
import type { NpmFeed } from "./npmFeed";
import type { NugetFeed } from "./nugetFeed";
import type { OctopusProjectFeed } from "./octopusProjectFeed";
import { every } from "lodash";

export type ExternalFeed = NugetFeed | DockerFeed | MavenFeed | GitHubFeed | HelmFeed | AwsElasticContainerRegistryFeed | NpmFeed;

export type Feed = ExternalFeed | BuiltInFeed | OctopusProjectFeed;

export function feedTypeCanSearchEmpty(feed: FeedType): boolean {
    return ![FeedType.Docker, FeedType.AwsElasticContainerRegistry, FeedType.Maven, FeedType.GitHub].includes(feed);
}

export function feedTypeSupportsExtraction(feed: FeedType): boolean {
    // Container images can not be extracted
    return ![FeedType.Docker, FeedType.AwsElasticContainerRegistry].includes(feed);
}

export function isOctopusProjectFeed(feed: FeedType): boolean {
    return (feed as string) === "OctopusProject";
}

export function containerRegistryFeedTypes(): FeedType[] {
    return [FeedType.Docker, FeedType.AwsElasticContainerRegistry];
}

export function isContainerImageRegistry(feed: FeedType): boolean {
    return containerRegistryFeedTypes().includes(feed);
}

export const getFeedTypeLabel = (feedType?: FeedType[]) => {
    const requiresContainerImageRegistryFeed = feedType && feedType.length >= 1 && every(feedType, (f) => isContainerImageRegistry(f));
    const requiresHelmChartFeed = feedType && feedType.length === 1 && feedType[0] === FeedType.Helm;

    if (requiresContainerImageRegistryFeed) {
        return "Container Image Registry";
    }
    if (requiresHelmChartFeed) {
        return "Helm Chart Repository";
    }
    return "Package";
};
