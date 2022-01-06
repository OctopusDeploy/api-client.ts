import { Client, ClientConfiguration, OctopusSpaceRepository } from "../../";
import type {
    ChannelResource,
    ProjectResource,

} from "@octopusdeploy/message-contracts";
import { PersistenceSettingsType, ReleaseResource } from "@octopusdeploy/message-contracts";
import { HasVersionControlledPersistenceSettings } from "@octopusdeploy/message-contracts/dist/projectResource";
import { ChannelVersionRuleTester } from "./channel-version-rule-tester";
import { PackageVersionResolver } from "./package-version-resolver";
import { ReleasePlan } from "./release-plan";
import { ReleasePlanBuilder } from "./release-plan-builder";
import { throwIfUndefined } from "../throw-if-undefined";
import { ReleaseOptions } from "./release-options";
import { DeploymentOptions } from "../deployRelease/deployment-options";
import { connect } from "../connect";
import { DeploymentBase } from "../deployRelease/deployment-base";

function releaseOptionsDefaults(): ReleaseOptions {
    return {
        ignoreChannelRules: false,
        ignoreExisting: false,
        packages: [],
        whatIf: false,
    };
}

export async function createRelease(
    configuration: ClientConfiguration,
    space: string,
    project: string,
    releaseOptions?: Partial<ReleaseOptions>,
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

    await new CreateRelease(client, repository, configuration.apiUri, proj, releaseOptions, deploymentOptions).execute();
}

class CreateRelease extends DeploymentBase {
    private gitReference: string | undefined;
    private releasePlanBuilder: ReleasePlanBuilder;
    private plan: ReleasePlan | undefined;
    private versionNumber: string | undefined;
    private readonly packageVersionResolver: PackageVersionResolver;
    private readonly releaseOptions: ReleaseOptions;

    constructor(
        client: Client,
        repository: OctopusSpaceRepository,
        serverUrl: string,
        private readonly project: ProjectResource,
        releaseOptions?: Partial<ReleaseOptions>,
        deploymentOptions?: Partial<DeploymentOptions>
    ) {
        super(client, repository, serverUrl, deploymentOptions);

        this.releaseOptions = {
            ...releaseOptionsDefaults(),
            ...releaseOptions,
        };

        this.packageVersionResolver = new PackageVersionResolver(client);
        this.releasePlanBuilder = new ReleasePlanBuilder(client, this.packageVersionResolver, new ChannelVersionRuleTester(client));
    }

    private async releaseNotesFallBackToDeploymentSettings() {
        if (this.releaseOptions.releaseNotes) return;
    }

    async execute(): Promise<void> {
        this.validateProjectPersistenceRequirements();

        if (this.releaseOptions.defaultPackageVersion != undefined) {
            this.packageVersionResolver.setDefault(this.releaseOptions.defaultPackageVersion);
        }

        if (this.releaseOptions.packagesFolder != undefined) {
            await this.packageVersionResolver.addFolder(this.releaseOptions.packagesFolder);
        }

        for (const pkg of this.releaseOptions.packages) {
            await this.packageVersionResolver.addPackage(pkg.id, pkg.version);
        }

        const plan = await this.buildReleasePlan();

        if (this.releaseOptions.releaseNumber) {
            this.versionNumber = this.releaseOptions.releaseNumber;
            this.client.debug(`Using version number provided on command-line: ${this.versionNumber}`);
        } else if (plan.releaseTemplate.NextVersionIncrement) {
            this.versionNumber = plan.releaseTemplate.NextVersionIncrement;
            this.client.debug(`Using version number from release template: ${this.versionNumber}`);
        } else if (plan.releaseTemplate.VersioningPackageStepName) {
            this.versionNumber = plan.getActionVersionNumber(
                plan.releaseTemplate.VersioningPackageStepName,
                plan.releaseTemplate.VersioningPackageReferenceName as string | undefined
            );
            this.client.debug(`Using version number from package step: ${this.versionNumber}`);
        } else {
            throw new Error("A version number was not specified and could not be automatically selected.");
        }

        if (plan.isViableReleasePlan()) {
            this.client.info(`Release plan for ${this.project.Name} ${this.versionNumber}`);
        } else {
            this.client.warn(`Release plan for ${this.project.Name} ${this.versionNumber}`);
        }

        if (plan.hasUnresolvedSteps())
            throw new Error(
                "Package versions could not be resolved for one or more of the package packageSteps in this release. See the errors above for details. Either ensure the latest version of the package can be automatically resolved, or set the version to use specifically by using the --package argument."
            );
        if (!plan.channelHasAnyEnabledSteps()) {
            throw new Error(`Channel ${plan.channel?.Name} has no available steps`);
        }

        if (plan.hasStepsViolatingChannelVersionRules()) {
            if (this.releaseOptions.ignoreChannelRules)
                this.client.warn(
                    `At least one step violates the package version rules for the Channel '${plan.channel?.Name}'. Forcing the release to be created ignoring these rules...`
                );
            else
                throw new Error(
                    `At least one step violates the package version rules for the Channel '${plan.channel?.Name}'. Either correct the package versions for this release, let Octopus select the best channel by omitting the --channel argument, select a different channel using --channel=MyChannel argument, or ignore these version rules altogether by using the --ignoreChannelRules argument.`
                );
        }

        if (this.releaseOptions.ignoreExisting) {
            this.client.debug(`Checking for existing release for ${this.project.Name} ${this.versionNumber} because you specified --ignoreExisting...`);
            try {
                const found = await this.repository.projects.getReleaseByVersion(this.project, this.versionNumber);
                if (found !== undefined) {
                    this.client.info(
                        `A release of ${this.project.Name} with the number ${this.versionNumber} already exists, and you specified --ignoreExisting, so we won't even attempt to create the release.`
                    );
                    return;
                }
            } catch {
                // Expected
                this.client.debug("No release exists - the coast is clear!");
            }
        }

        if (this.releaseOptions.whatIf) {
            // We were just doing a dry run - bail out here
            if (this.deploymentOptions.deployTo.length > 0)
                this.client.info(`[WhatIf] This release would have been created using the release plan and deployed to ${this.deploymentOptions.deployTo}`);
            else this.client.info("[WhatIf] This release would have been created using the release plan");
        } else {
            // Actually create the release!
            this.client.debug("Creating release...");

            await this.releaseNotesFallBackToDeploymentSettings();

            const releaseResource: Partial<ReleaseResource> = {
                Version: this.versionNumber,
                ProjectId: this.project.Id,
            };
            if (plan.channel?.Id) {
                releaseResource.ChannelId = plan.channel?.Id;
            }

            releaseResource.ReleaseNotes = "";
            releaseResource.SelectedPackages = plan.getSelections();
            releaseResource.VersionControlReference =
                this.project.PersistenceSettings.Type === PersistenceSettingsType.VersionControlled
                    ? {
                          GitRef: this.releaseOptions.gitRef,
                          GitCommit: this.releaseOptions.gitCommit,
                      }
                    : undefined;
            const release = await this.repository.releases.create(releaseResource as ReleaseResource, this.releaseOptions.ignoreChannelRules);

            this.client.info(`Release ${release.Version} created successfully!`);
            if (release.VersionControlReference?.GitCommit)
                this.client.info(
                    `Release created from commit ${release.VersionControlReference.GitCommit} of git reference ${release.VersionControlReference.GitRef}.`
                );

            await this.deployRelease(this.project, release);
        }
    }

    private async buildReleasePlan() {
        if (this.releaseOptions.channel) {
            this.client.info(`Building release plan for channel '${this.releaseOptions.channel}'...`);

            const matchingChannel = await this.getMatchingChannel(this.releaseOptions.channel);

            return await this.releasePlanBuilder.build(
                this.repository,
                this.project,
                matchingChannel,
                this.releaseOptions.packagePrerelease,
                this.releaseOptions.gitRef,
                this.releaseOptions.gitCommit
            );
        }

        this.client.debug("Automatically selecting the best channel for this release...");
        return await this.autoSelectBestReleasePlanOrThrow();
    }

    async getChannel() {
        let branch: string | undefined = undefined;

        if (HasVersionControlledPersistenceSettings(this.project.PersistenceSettings)) {
            branch = this.releaseOptions.gitCommit ?? this.releaseOptions.gitRef ?? this.project.PersistenceSettings.DefaultBranch;
        }
        return await this.repository.projects.getChannels(this.project, branch, 0, this.repository.projects.takeAll);
    }

    private async autoSelectBestReleasePlanOrThrow() {
        // Build a release plan for each channel to determine which channel is the best match for the provided options
        const channels = await this.getChannel();
        const candidateChannels = channels.Items;
        const releasePlans: ReleasePlan[] = [];
        for (const channel of candidateChannels) {
            this.client.info(`Building a release plan for Channel '${channel.Name}'...`);

            this.plan = await this.releasePlanBuilder.build(
                this.repository,
                this.project,
                channel,
                this.releaseOptions.packagePrerelease,
                this.releaseOptions.gitRef,
                this.releaseOptions.gitCommit
            );

            releasePlans.push(this.plan);
            if (!this.plan.channelHasAnyEnabledSteps()) this.client.warn(`Channel ${channel.Name} does not contain any packageSteps`);
        }

        const viablePlans = releasePlans.filter((p) => p.isViableReleasePlan());
        if (viablePlans.length === 0)
            throw new Error(
                "There are no viable release plans in any channels using the provided arguments. The following release plans were considered:" +
                    `Sorry not implemented yet!`
            );

        if (viablePlans.length === 1) {
            const selectedPlan = viablePlans[0];
            this.client.info(`Selected the release plan for Channel '${selectedPlan.channel?.Name}' - it is a perfect match`);
            return selectedPlan;
        }

        if (viablePlans.length > 1 && viablePlans.some((p) => p.channel?.IsDefault)) {
            const selectedPlan = viablePlans.find((p) => p.channel?.IsDefault) as ReleasePlan;
            this.client.info(
                `Selected the release plan for Channel '${selectedPlan.channel?.Name}' - there were multiple matching Channels (${viablePlans
                    .map((p) => p.channel?.Name)
                    .reduce((previousValue, currentValue) => `${previousValue},${currentValue}`, "")}) so we selected the default channel.`
            );
            return selectedPlan;
        }

        throw new Error(
            `There are ${viablePlans.length} viable release plans using the provided arguments so we cannot auto-select one. The viable release plans are:` +
                `Sorry not implemented yet!` +
                "The unviable release plans are:" +
                `Sorry not implemented yet!`
        );
    }

    private async getMatchingChannel(channelNameOrId: string): Promise<ChannelResource> {
        return throwIfUndefined(
            async (nameOrId) => this.repository.channels.find(nameOrId),
            async (id) => this.repository.channels.get(id),
            "Channels",
            "channel",
            channelNameOrId
        );
    }

    validateProjectPersistenceRequirements() {
        const wasGitRefProvided = this.releaseOptions.gitRef;
        if (!wasGitRefProvided && this.project.PersistenceSettings.Type === PersistenceSettingsType.VersionControlled) {
            this.gitReference = this.project.PersistenceSettings.DefaultBranch;
            this.client.info(`No gitRef parameter provided. Using Project Default Branch: ${this.project.PersistenceSettings.DefaultBranch}`);
        }

        if (!this.project.IsVersionControlled && wasGitRefProvided)
            throw new Error(
                "Since the provided project is not a version controlled project," +
                    " the --gitCommit and --gitRef arguments are not supported for this command."
            );
    }
}
