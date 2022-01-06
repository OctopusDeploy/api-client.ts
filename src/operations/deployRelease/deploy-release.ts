import { ClientConfiguration } from "../../clientConfiguration";
import { connect } from "../connect";
import { throwIfUndefined } from "../throw-if-undefined";
import { ChannelResource, ProjectResource, ReleaseResource, ResourceCollection } from "@octopusdeploy/message-contracts";
import { DeploymentBase } from "./deployment-base";
import { Client } from "../../client";
import { OctopusSpaceRepository } from "../../repository";
import { DeploymentOptions } from "./deployment-options";
import { SemVer } from "semver";
import { CouldNotFindError } from "../could-not-find-error";

export async function deployRelease(
    configuration: ClientConfiguration,
    space: string,
    project: string,
    version: string | "latest",
    deployTo: string[],
    channel?: string | undefined,
    updateVariables?: boolean | undefined,
    deploymentOptions?: Partial<DeploymentOptions>
): Promise<void> {
    const [repository, client] = await connect(configuration, space);

    const proj = await throwIfUndefined<ProjectResource>(
        async (nameOrId) => await repository.projects.find(nameOrId),
        async (id) => repository.projects.get(id),
        "Projects",
        "project",
        project
    );

    await new DeployRelease(client, repository, configuration.apiUri, proj, deployTo, deploymentOptions).execute(version, channel, updateVariables);
}

class DeployRelease extends DeploymentBase {
    constructor(
        client: Client,
        repository: OctopusSpaceRepository,
        serverUrl: string,
        private readonly project: ProjectResource,
        deployTo: string[],
        deploymentOptions?: Partial<DeploymentOptions>
    ) {
        super(client, repository, serverUrl, {
            ...deploymentOptions,
            ...{ deployTo: deployTo },
        });
    }

    async execute(version: string, channel: string | undefined, updateVariables: boolean | undefined = false) {
        let channelResource: ChannelResource | undefined;
        if (channel) {
            channelResource = await throwIfUndefined<ChannelResource>(
                async (nameOrId) => await this.repository.channels.find(nameOrId),
                async (id) => this.repository.channels.get(id),
                "Channels",
                "channel",
                channel
            );
        }

        const releaseToPromote = await this.getReleaseByVersion(version, this.project, channelResource);

        if (updateVariables) {
            this.client.debug("Updating the release variable snapshot with variables from the project");
            await this.repository.releases.snapshotVariables(releaseToPromote);
        }
        await this.deployRelease(this.project, releaseToPromote);
    }

    async getReleaseByVersion(versionNumber: string, project: ProjectResource, channel: ChannelResource | undefined) {
        let message: string;
        let releaseToPromote: ReleaseResource | undefined;
        
        if (versionNumber === "latest") {
            message = channel == null ? "latest release for project" : `latest release in channel '${channel.Name}'`;

            this.client.debug(`Finding ${message}`);

            const releases = await this.repository.projects.getReleases(project);
            const compareFn = (r1: ReleaseResource, r2: ReleaseResource) => {
                const r1Version = new SemVer(r1.Version);
                const r2Version = new SemVer(r2.Version);

                return r1Version.compare(r2Version);
            };

            if (releases.TotalResults > 0) {
                if (channel === undefined) {
                    releaseToPromote = releases.Items.sort(compareFn)[0];
                } else {
                    await this.paginate(releases, this.repository, (page) => {
                        releaseToPromote = page.Items.sort(compareFn).find((r) => r.ChannelId === channel.Id);

                        // If we haven't found one yet, keep paginating
                        return releaseToPromote === undefined;
                    });
                }
            } else {
                message = `release ${versionNumber}`;
                this.client.debug(`Finding ${message}`);
                releaseToPromote = await this.repository.projects.getReleaseByVersion(project, versionNumber);
            }
        }

        if (releaseToPromote === undefined) throw new CouldNotFindError(`the ${project.Name}`);

        return releaseToPromote;
    }

    async paginate(
        source: ResourceCollection<ReleaseResource>,
        repository: OctopusSpaceRepository,
        getNextPage: (items: ResourceCollection<ReleaseResource>) => boolean
    ) {
        while (getNextPage(source) && source.Items.length > 0 && source.Links["Page.Next"])
            source = await repository.client.get<ResourceCollection<ReleaseResource>>(source.Links["Page.Next"]);
    }
}
