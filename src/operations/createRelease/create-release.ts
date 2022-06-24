import {
    ChannelResource,
    HasVersionControlledPersistenceSettings,
    PersistenceSettingsType,
    ProjectResource,
    ReleaseResource,
} from "@octopusdeploy/message-contracts";
import { processConfiguration } from "../../clientConfiguration";
import { OctopusSpaceRepository } from "../../repository";
import { DeploymentBase } from "../deployRelease/deployment-base";
import { DeploymentOptions } from "../deployRelease/deployment-options";
import { throwIfUndefined } from "../throw-if-undefined";
import { ChannelVersionRuleTester } from "./channel-version-rule-tester";
import { PackageVersionResolver } from "./package-version-resolver";
import { ReleaseOptions } from "./release-options";
import { ReleasePlan } from "./release-plan";
import { ReleasePlanBuilder } from "./release-plan-builder";
function releaseOptionsDefaults(): ReleaseOptions {
    return {
        ignoreChannelRules: false,
        ignoreExisting: false,
        packages: [],
        whatIf: false,
    };
}

export async function createRelease(
    repository: OctopusSpaceRepository,
    project: ProjectResource,
    releaseOptions?: Partial<ReleaseOptions>,
    deploymentOptions?: Partial<DeploymentOptions>
): Promise<void> {
    const proj = await throwIfUndefined<ProjectResource>(
        async (nameOrId) => await repository.projects.find(nameOrId),
        async (id) => repository.projects.get(id),
        "Projects",
        "project",
        project.Name
    );

    const configuration = processConfiguration();

    console.log(`Creating a release...`);
    await new CreateRelease(repository, configuration.apiUri, proj, releaseOptions, deploymentOptions).execute();
    console.log(`Release created successfully.`);
}

class CreateRelease extends DeploymentBase {
    private gitReference: string | undefined;
    private releasePlanBuilder: ReleasePlanBuilder;
    private plan: ReleasePlan | undefined;
    private versionNumber: string | undefined;
    private readonly packageVersionResolver: PackageVersionResolver;
    private readonly releaseOptions: ReleaseOptions;

    constructor(
        repository: OctopusSpaceRepository,
        serverUrl: string,
        private readonly project: ProjectResource,
        releaseOptions?: Partial<ReleaseOptions>,
        deploymentOptions?: Partial<DeploymentOptions>
    ) {
        super(repository, serverUrl, deploymentOptions);

        this.releaseOptions = {
            ...releaseOptionsDefaults(),
            ...releaseOptions,
        };

        this.packageVersionResolver = new PackageVersionResolver();
        this.releasePlanBuilder = new ReleasePlanBuilder(repository.client, this.packageVersionResolver, new ChannelVersionRuleTester(repository.client));
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
        if (!plan) return;

        if (this.releaseOptions.releaseNumber) {
            this.versionNumber = this.releaseOptions.releaseNumber;
            console.debug(`Using version number provided on command-line: ${this.versionNumber}`);
        } else if (plan.releaseTemplate.NextVersionIncrement) {
            this.versionNumber = plan.releaseTemplate.NextVersionIncrement;
            console.debug(`Using version number from release template: ${this.versionNumber}`);
        } else if (plan.releaseTemplate.VersioningPackageStepName) {
            this.versionNumber = plan.getActionVersionNumber(
                plan.releaseTemplate.VersioningPackageStepName,
                plan.releaseTemplate.VersioningPackageReferenceName
            );
            console.debug(`Using version number from package step: ${this.versionNumber}`);
        } else {
            throw new Error("A version number was not specified and could not be automatically selected.");
        }

        if (plan.isViableReleasePlan()) {
            console.info(`Release plan for ${this.project.Name} ${this.versionNumber}`);
        } else {
            console.warn(`Release plan for ${this.project.Name} ${this.versionNumber}`);
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
                console.warn(
                    `At least one step violates the package version rules for the Channel '${plan.channel?.Name}'. Forcing the release to be created ignoring these rules...`
                );
            else
                throw new Error(
                    `At least one step violates the package version rules for the Channel '${plan.channel?.Name}'. Either correct the package versions for this release, let Octopus select the best channel by omitting the --channel argument, select a different channel using --channel=MyChannel argument, or ignore these version rules altogether by using the --ignoreChannelRules argument.`
                );
        }

        if (this.releaseOptions.ignoreExisting) {
            console.debug(`Checking for existing release for ${this.project.Name} ${this.versionNumber} because you specified --ignoreExisting...`);
            try {
                const found = await this.repository.projects.getReleaseByVersion(this.project, this.versionNumber);
                if (found !== undefined) {
                    console.info(
                        `A release of ${this.project.Name} with the number ${this.versionNumber} already exists, and you specified --ignoreExisting, so we won't even attempt to create the release.`
                    );
                    return;
                }
            } catch {
                // Expected
                console.debug("No release exists - the coast is clear!");
            }
        }

        if (this.releaseOptions.whatIf) {
            // We were just doing a dry run - bail out here
            if (this.deploymentOptions.deployTo.length > 0)
                console.info(`[WhatIf] This release would have been created using the release plan and deployed to ${this.deploymentOptions.deployTo}`);
            else console.info("[WhatIf] This release would have been created using the release plan");
        } else {
            // Actually create the release!
            console.debug("Creating release...");

            await this.releaseNotesFallBackToDeploymentSettings();

            const releaseResource: Partial<ReleaseResource> = {
                ChannelId: plan.channel?.Id,
                ProjectId: this.project.Id,
                SelectedPackages: plan.getSelections(),
                Version: this.versionNumber,
            };

            releaseResource.VersionControlReference =
                this.project.PersistenceSettings.Type === PersistenceSettingsType.VersionControlled
                    ? {
                          GitRef: this.releaseOptions.gitRef,
                          GitCommit: this.releaseOptions.gitCommit,
                      }
                    : undefined;

            const release = await this.repository.releases.create(releaseResource as ReleaseResource, this.releaseOptions.ignoreChannelRules);

            console.info(`Release ${release.Version} created successfully.`);
            if (release.VersionControlReference?.GitCommit)
                console.info(
                    `Release created from commit ${release.VersionControlReference.GitCommit} of git reference ${release.VersionControlReference.GitRef}.`
                );

            await this.deployRelease(this.project, release);
        }
    }

    private async buildReleasePlan() {
        if (this.releaseOptions.channel) {
            console.info(`Building release plan for channel '${this.releaseOptions.channel.Name}'...`);

            const matchingChannel = await this.getMatchingChannel(this.releaseOptions.channel.Name);

            return await this.releasePlanBuilder.build(
                this.repository,
                this.project,
                matchingChannel,
                this.releaseOptions.packagePrerelease,
                this.releaseOptions.gitRef,
                this.releaseOptions.gitCommit
            );
        }

        console.debug("Automatically selecting the best channel for this release...");
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
            console.info(`Building a release plan for channel, "${channel.Name}"...`);

            this.plan = await this.releasePlanBuilder.build(
                this.repository,
                this.project,
                channel,
                this.releaseOptions.packagePrerelease,
                this.releaseOptions.gitRef,
                this.releaseOptions.gitCommit
            );

            releasePlans.push(this.plan);
            if (!this.plan.channelHasAnyEnabledSteps()) console.warn(`Channel, "${channel.Name}" does not have any enabled package steps.`);
        }

        const viablePlans = releasePlans.filter((p) => p.isViableReleasePlan());
        if (viablePlans.length === 0)
            throw new Error(
                "There are no viable release plans in any channels using the provided arguments. The following release plans were considered:" +
                    `Sorry not implemented yet!`
            );

        if (viablePlans.length === 1) {
            const selectedPlan = viablePlans[0];
            console.info(`Selected the release plan for channel, "${selectedPlan.channel?.Name}".`);
            return selectedPlan;
        }

        if (viablePlans.length > 1 && viablePlans.some((p) => p.channel?.IsDefault)) {
            const selectedPlan = viablePlans.find((p) => p.channel?.IsDefault);
            console.info(
                `Selected the release plan for channel "${selectedPlan?.channel?.Name}" - there were multiple matching Channels (${viablePlans
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
            console.info(`No gitRef parameter provided. Using Project Default Branch: ${this.project.PersistenceSettings.DefaultBranch}`);
        }

        if (!this.project.IsVersionControlled && wasGitRefProvided)
            throw new Error(
                "Since the provided project is not a version controlled project," +
                    " the --gitCommit and --gitRef arguments are not supported for this command."
            );
    }
}
