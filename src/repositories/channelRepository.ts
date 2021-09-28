import type {
    ChannelOclResource,
    ChannelResource,
    CreateChannelCommand,
    FeedType,
    ICommitCommand,
    ModifyChannelCommand,
    ModifyChannelOclCommand,
    ProjectResource,
    ResourceCollection,
    ReleaseResource,
    VersionRuleTestResponse
} from "@octopusdeploy/message-contracts";
import type { ListArgs } from "./basicRepository";
import type { Client } from "../client";
import { ProjectScopedRepository } from "./projectScopedRepository";
import type ProjectRepository from "./projectRepository";
import type { RouteArgs } from "../resolver";

export type ReleasesListArgs = {
    searchByVersion?: string;
} & ListArgs;

export type SearchOptions = {
    version: string;
    versionRange: string;
    preReleaseTag: string;
    feedType: FeedType;
};

export class ChannelRepository extends ProjectScopedRepository<ChannelResource, ChannelResource> {
    constructor(projectRepository: ProjectRepository, client: Client) {
        super(projectRepository, "Channels", client);
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

    createForProject(projectResource: ProjectResource, channel: ChannelResource, args: RouteArgs): Promise<ChannelResource> {
        const payload: CreateChannelCommand = channel;
        this.addCommitMessage(payload, args);

        if (payload !== undefined) {
            const link = projectResource.Links[this.collectionLinkName];
            return this.client.create<ChannelResource, ChannelResource>(link, payload, args).then((r) => this.notifySubscribersToDataModifications(r));
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