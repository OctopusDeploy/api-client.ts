/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/consistent-type-assertions */

import type {
    BuiltInFeedResource,
    BuiltInFeedStatsResource,
    ExternalFeedResource,
    FeedResource,
    OctopusProjectFeedResource,
    PackageDescriptionResource,
    PackageVersionResource,
    ResourceCollection
} from "@octopusdeploy/message-contracts";
import { FeedType } from "@octopusdeploy/message-contracts";
import { BasicRepository } from "./basicRepository";
import type { Client } from "../client";
import type { ListArgs } from "./basicRepository";

type FeedRepositoryListArgs = {
    feedType?: FeedType[];
    ids?: string | string[];
    name?: string | string[];
} & ListArgs;

export interface PackageSearchOptions extends ListArgs {
    includePreRelease?: boolean;
    preReleaseTag?: string;
    versionRange?: string;
    includeReleaseNotes?: boolean;
    filter?: string;
}

export class ExternalFeedsFilterTypes {
    private static _defaultFilterTypes = Object.keys(FeedType)
        .filter((f) => f !== FeedType.BuiltIn && f !== FeedType.OctopusProject)
        .map((f) => f as FeedType);

    static get defaultFilterTypes(): FeedType[] {
        return this._defaultFilterTypes;
    }
}

export class FeedRepository extends BasicRepository<FeedResource, FeedResource, FeedRepositoryListArgs> {
    constructor(client: Client) {
        super("Feeds", client);
    }

    async getBuiltIn() {
        const result = await this.client.get<ResourceCollection<FeedResource>>(this.client.getLink("Feeds"), { feedType: FeedType.BuiltIn });

        return result.Items[0] as BuiltInFeedResource;
    }

    async getOctopusProject() {
        const result = await this.client.get<ResourceCollection<FeedResource>>(this.client.getLink("Feeds"), { feedType: FeedType.OctopusProject });

        return result.Items[0] as OctopusProjectFeedResource;
    }

    async getBuiltInStatus() {
        return this.client.get<BuiltInFeedStatsResource>(this.client.getLink("BuiltInFeedStats"));
    }

    async listExternal(): Promise<ResourceCollection<ExternalFeedResource>> {
        return this.client.get(this.client.getLink("Feeds"), { feedType: ExternalFeedsFilterTypes.defaultFilterTypes });
    }

    searchPackages(
        feed: FeedResource,
        searchOptions: {
            term: string;
            take?: number;
            skip?: number;
        }
    ): Promise<ResourceCollection<PackageDescriptionResource>> {
        return this.client.get(feed.Links.SearchPackagesTemplate, searchOptions);
    }

    searchPackageVersions(feed: FeedResource, packageId: string, searchOptions: PackageSearchOptions): Promise<ResourceCollection<PackageVersionResource>> {
        return this.client.get(feed.Links["SearchPackageVersionsTemplate"], { packageId, ...searchOptions });
    }

    getNotes(feed: FeedResource, packageId: string, version: any) {
        return this.client.getRaw(feed.Links["NotesTemplate"], { packageId, version });
    }
}