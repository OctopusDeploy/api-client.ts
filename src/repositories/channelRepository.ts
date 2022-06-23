import type {
    ChannelOclResource,
    ChannelResource,
    CreateChannelCommand,
    FeedType,
    ICommitCommand,
    ModifyChannelCommand,
    ModifyChannelOclCommand,
    NewChannelResource,
    ProjectResource,
    ReleaseResource,
    ResourceCollection,
    VersionRuleTestResponse,
} from "@octopusdeploy/message-contracts";
import type { Client } from "../client";
import type { RouteArgs } from "../resolver";
import type { AllArgs, ListArgs } from "./basicRepository";
import type ProjectRepository from "./projectRepository";
import { ProjectScopedRepository } from "./projectScopedRepository";

type ChannelRepositoryListArgs = {
    name?: string;
    partialName?: string;
    skip?: number;
    take?: number;
} & RouteArgs;

type ChannelRepositoryAllArgs = {
    ids?: string[];
} & AllArgs;

export type ReleasesListArgs = {
    searchByVersion?: string;
} & ListArgs;

export type SearchOptions = {
    version: string;
    versionRange: string;
    preReleaseTag: string;
    feedType: FeedType;
};

export class ChannelRepository extends ProjectScopedRepository<ChannelResource, NewChannelResource, ChannelRepositoryListArgs, ChannelRepositoryAllArgs> {
    constructor(projectRepository: ProjectRepository, client: Client) {
        super(projectRepository, "Channels", client);
    }

    async find(nameOrId: string): Promise<ChannelResource | undefined> {
        if (nameOrId.length === 0) return;
        try {
            return await this.get(nameOrId);
        } catch {
            // silently capture any exceptions; it is assumed the ID cannot be found
            // and the algorithm moves on to searching for matching names
        }

        const channels = await this.list({
            partialName: nameOrId,
        });
        return channels.Items.find((e) => e.Name.localeCompare(nameOrId, undefined, { sensitivity: "base" }) === 0);
    }

    ruleTest(searchOptions: SearchOptions) {
        return this.client.post<VersionRuleTestResponse>(this.client.getLink("VersionRuleTest"), searchOptions);
    }

    getReleases(channel: ChannelResource, options?: ReleasesListArgs): Promise<ResourceCollection<ReleaseResource>> {
        return this.client.get(channel.Links["Releases"], options);
    }

    getOcl(channel: ChannelResource) {
        return this.client.get<ChannelOclResource>(channel.Links["RawOcl"]);
    }

    modifyOcl(channel: ChannelResource, command: ModifyChannelOclCommand) {
        return this.client.update<ChannelOclResource>(channel.Links["RawOcl"], command);
    }

    modify(channel: ChannelResource, args?: {} | undefined): Promise<ChannelResource> {
        const payload: ModifyChannelCommand = channel;
        this.addCommitMessage(payload, args);

        if (payload !== undefined) {
            return this.client.update(channel.Links.Self, payload);
        } else {
            return super.modify(channel, args);
        }
    }

    createForProject(projectResource: ProjectResource, channel: NewChannelResource, args: RouteArgs): Promise<ChannelResource> {
        const payload: CreateChannelCommand = channel;
        this.addCommitMessage(payload, args);

        if (payload !== undefined) {
            const link = projectResource.Links[this.collectionLinkName];
            return this.client.create<NewChannelResource, ChannelResource>(link, payload, args).then((r) => this.notifySubscribersToDataModifications(r));
        } else {
            return super.createForProject(projectResource, channel, args);
        }
    }

    addCommitMessage(command: ICommitCommand, args?: {} | undefined) {
        if (args !== undefined && "gitRef" in args && "commitMessage" in args) {
            command.ChangeDescription = args["commitMessage"];
        }
    }
}
