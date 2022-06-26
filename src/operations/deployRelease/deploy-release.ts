import { ChannelResource, EnvironmentResource, ProjectResource, ReleaseResource, ResourceCollection } from "@octopusdeploy/message-contracts";
import { SemVer } from "semver";
import { processConfiguration } from "../../clientConfiguration";
import { OctopusSpaceRepository } from "../../repository";
import { CouldNotFindError } from "../could-not-find-error";
import { throwIfUndefined } from "../throw-if-undefined";
import { DeploymentBase } from "./deployment-base";
import { DeploymentOptions } from "./deployment-options";

export async function deployRelease(
    repository: OctopusSpaceRepository,
    project: ProjectResource,
    version: string | "latest",
    deployTo: EnvironmentResource[],
    channel?: ChannelResource,
    updateVariables?: boolean | undefined,
    deploymentOptions?: Partial<DeploymentOptions>
): Promise<void> {
    const proj = await throwIfUndefined<ProjectResource>(
        async (nameOrId) => await repository.projects.find(nameOrId),
        async (id) => repository.projects.get(id),
        "Projects",
        "project",
        project.Id
    );

    const configuration = processConfiguration();
    await new DeployRelease(repository, configuration.apiUri, proj, deployTo, deploymentOptions).execute(version, channel, updateVariables);
}

class DeployRelease extends DeploymentBase {
    constructor(
        repository: OctopusSpaceRepository,
        serverUrl: string,
        private readonly project: ProjectResource,
        deployTo: EnvironmentResource[],
        deploymentOptions?: Partial<DeploymentOptions>
    ) {
        super(repository, serverUrl, {
            ...deploymentOptions,
            ...{ deployTo: deployTo },
        });
    }

    async execute(version: string, channel?: ChannelResource, updateVariables: boolean | undefined = false) {
        let channelResource: ChannelResource | undefined = undefined;
        if (channel) {
            channelResource = await throwIfUndefined<ChannelResource>(
                async (nameOrId) => await this.repository.channels.find(nameOrId),
                async (id) => this.repository.channels.get(id),
                "Channels",
                "channel",
                channel.Name
            );
        }

        const releaseToPromote = await this.getReleaseByVersion(version, this.project, channelResource);

        if (updateVariables) {
            console.debug("Updating the release variable snapshot with variables from the project");
            await this.repository.releases.snapshotVariables(releaseToPromote);
        }
        await this.deployRelease(this.project, releaseToPromote);
    }

    async getReleaseByVersion(versionNumber: string, project: ProjectResource, channel: ChannelResource | undefined) {
        let releaseToPromote: ReleaseResource | undefined = undefined;

        if (versionNumber === "latest") {
            const message = channel === null ? "latest release for project" : `latest release in channel '${channel?.Name}'`;

            console.debug(`Finding ${message}...`);

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
                console.debug(`Finding release ${versionNumber}`);
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
