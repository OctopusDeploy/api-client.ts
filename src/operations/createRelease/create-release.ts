import {Client, ClientConfiguration, OctopusSpaceRepository, Repository} from "../../";
import type {
    ChannelResource,
    CreateDeploymentResource,
    DeploymentPromotionTarget,
    DeploymentResource,
    DeploymentTemplateResource,
    ProjectResource,
    TenantResource,
} from "@octopusdeploy/message-contracts";
import {PersistenceSettingsType, ReleaseResource} from "@octopusdeploy/message-contracts";
import {ControlType, VariableValue} from "@octopusdeploy/message-contracts/dist/form";
import {HasVersionControlledPersistenceSettings} from "@octopusdeploy/message-contracts/dist/projectResource";
import {ChannelVersionRuleTester} from "./channel-version-rule-tester";
import {CouldNotFindError} from "./could-not-find-error";
import {ExecutionResourceWaiter} from "./execution-resource-waiter";
import {PackageVersionResolver} from "./package-version-resolver";
import {ReleasePlan} from "./release-plan";
import {ReleasePlanBuilder} from "./release-plan-builder";
import {throwIfUndefined} from "./throw-if-undefined";
import {ReleaseOptions} from "./release-options";
import {DeploymentOptions} from "./deployment-options";

function deploymentOptionsDefaults() : DeploymentOptions {
    return {
        cancelOnTimeout: false,
        deployTo: [],
        deploymentCheckSleepCycle: 10000, // 10 seconds
        deploymentTimeout: 600000, // 10 minutes
        excludeMachines: [],
        force: false,
        forcePackageDownload: false,
        noRawLog: false,
        progress: true,
        skip: [],
        specificMachines: [],
        tenantTags: [],
        tenants: [],
        variable: [],
        waitForDeployment: false
    }
}

function releaseOptionsDefaults() : ReleaseOptions {
    return {
        defaultPackageVersion: true,
        ignoreChannelRules: false,
        ignoreExisting: false,
        packages: [],
        whatIf: false
    }
}

export async function createRelease(configuration: ClientConfiguration, serverUrl: string, space: string, project: string, releaseOptions?: Partial<ReleaseOptions>, deploymentOptions?: Partial<DeploymentOptions>): Promise<void> {
    const client = await Client.create(configuration);
    if (client === undefined) {
        throw new Error("client could not be constructed");
    }

    const releaseConfiguration = {
        ...releaseOptionsDefaults(),
        ...releaseOptions
    }

    const deploymentConfiguration = {
        ...deploymentOptionsDefaults(),
        ...deploymentOptions
    }

    if(!client.isConnected() && !configuration.autoConnect) {
        await client.connect((message, error) => error ? client.error("Could not connect", error) : client.info(message));
    }

    const repository = await new Repository(client).forSpace(space);
    const proj = await throwIfUndefined<ProjectResource>(
        async (nameOrId) => await repository.projects.find(nameOrId),
        async (id) => repository.projects.get(id),
        "Projects",
        "project",
        project
    );

    await new CreateRelease(client, repository, serverUrl, proj, releaseConfiguration, deploymentConfiguration).execute();
}

class CreateRelease {
    private gitReference: string | undefined;
    private releasePlanBuilder: ReleasePlanBuilder;
    private plan: ReleasePlan | undefined;
    private versionNumber: string | undefined;
    private promotionTargets: DeploymentPromotionTarget[] = [];
    private deployments: DeploymentResource[] = [];

    constructor(
        private readonly client: Client,
        private readonly repository: OctopusSpaceRepository,
        private readonly serverUrl: string,
        private readonly project: ProjectResource,
        private readonly releaseOptions: ReleaseOptions, private readonly deploymentOptions: DeploymentOptions) {
        this.releasePlanBuilder = new ReleasePlanBuilder(client, new PackageVersionResolver(client), new ChannelVersionRuleTester(client));
    }

    async releaseNotesFallBackToDeploymentSettings() {
        if (this.releaseOptions.releaseNotes) return;
    }

    async execute(): Promise<void> {
        this.validateProjectPersistenceRequirements();
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
                this.client.info(`Release created from commit ${release.VersionControlReference.GitCommit} of git reference ${release.VersionControlReference.GitRef}.`);

            /*
      commandOutputProvider.ServiceMessage(
        'setParameter',
        new { name = 'octo.releaseNumber', value = release.Version }()
      );
      commandOutputProvider.TfsServiceMessage(ServerBaseUrl, project, release);
*/
            await this.deployRelease(this.project, release);
        }
    }

    async getTenants(project: ProjectResource, environmentName: string, release: ReleaseResource, releaseTemplate: DeploymentTemplateResource) {
        if (this.deploymentOptions.tenants.length === 0 && this.deploymentOptions.tenantTags.length === 0) return [];

        const deployableTenants: TenantResource[] = [];

        if (this.deploymentOptions.tenants.some((t) => t === "*")) {
            const tenantPromotions = releaseTemplate.TenantPromotions.filter((tp) =>
                tp.PromoteTo.some((promo) =>
                    promo.Name.localeCompare(environmentName, undefined, {
                        sensitivity: "accent",
                    }) === 0
                )
            ).map((tp) => tp.Id);
            const tenants = await this.repository.tenants.all({
                ids: tenantPromotions,
            });
            deployableTenants.push(...tenants);

            this.client.info(`Found ${deployableTenants.length} Tenants who can deploy ${project.Name} ${release.Version} to ${environmentName}`);
        } else {
            if (this.deploymentOptions.tenants.length > 0) {
                const tenantsByNameOrId = await this.repository.tenants.find(this.deploymentOptions.tenants);
                deployableTenants.push(...tenantsByNameOrId);

                let unDeployableTenants = deployableTenants.filter((dt) => !dt.ProjectEnvironments.hasOwnProperty(project.Id)).map((dt) => dt.Name);
                if (unDeployableTenants.length > 0)
                    throw new Error(
                        `Release '${release.Version}' of project '${project.Name}' cannot be deployed for tenant${
                            unDeployableTenants.length === 1 ? "" : "s"
                        } ${unDeployableTenants.join(" or ")}. This may be because either a) ${
                            unDeployableTenants.length === 1 ? "it is" : "they are"
                        } not connected to this project, or b) you do not have permission to deploy ${
                            unDeployableTenants.length === 1 ? "it" : "them"
                        } to this project.`
                    );

                unDeployableTenants = deployableTenants
                    .filter((dt) => {
                        const tenantPromo = releaseTemplate.TenantPromotions.find((tp) => tp.Id === dt.Id);
                        const result = tenantPromo === undefined || !tenantPromo?.PromoteTo.some((tdt) =>
                                tdt.Name.localeCompare(environmentName, undefined, {
                                    sensitivity: "accent",
                                }) === 0
                            );
                        return result;
                    })
                    .map((dt) => dt.Name);
                if (unDeployableTenants.length > 0)
                    throw new Error(
                        `Release '${release.Version}' of project '${project.Name}' cannot be deployed for tenant${
                            unDeployableTenants.length === 1 ? "" : "s"
                        } ${unDeployableTenants.join(" or ")} to environment '${environmentName}'. This may be because a) the tenant${
                            unDeployableTenants.length === 1 ? "" : "s"
                        } ${
                            unDeployableTenants.length === 1 ? "is" : "are"
                        } not connected to this environment, a) the environment does not exist or is misspelled, b) The lifecycle has not reached this phase, possibly due to previous deployment failure,  c) you don't have permission to deploy to this environment, d) the environment is not in the list of environments defined by the lifecycle, or e) ${
                            unDeployableTenants.length === 1 ? "it is" : "they are"
                        } unable to deploy to this channel.`
                    );
            }

            if (this.deploymentOptions.tenantTags.length > 0) {
                const tenantsByTag = await this.repository.tenants.list({
                    tags: this.deploymentOptions.tenantTags.toString(),
                    take: this.repository.tenants.takeAll,
                });
                const deployableByTag = tenantsByTag.Items.filter((dt) => {
                    const tenantPromo = releaseTemplate.TenantPromotions.find((tp) => tp.Id === dt.Id);
                    return (
                        tenantPromo !== undefined &&
                        tenantPromo.PromoteTo.some((tdt) =>
                            tdt.Name.localeCompare(environmentName, undefined, {
                                sensitivity: "accent",
                            }) === 0
                        )
                    );
                }).filter((tenant) => !deployableTenants.some((deployable) => deployable.Id === tenant.Id));
                deployableTenants.push(...deployableByTag);
            }
        }

        if (deployableTenants.length === 0)
            throw new Error(
                `No tenants are available to be deployed for release '${release.Version}' of project '${project.Name}' to environment '${environmentName}'.  This may be because a) No tenants matched the tags provided b) The tenants that do match are not connected to this project or environment, c) The tenants that do match are not yet able to release to this lifecycle phase, or d) you do not have the appropriate deployment permissions.`
            );

        return deployableTenants;
    }

    async getSpecificMachines() {
        const specificMachineIds = [];
        if (this.deploymentOptions.specificMachines.length > 0) {
            const machines = await this.repository.machines.all({
                ids: this.deploymentOptions.specificMachines,
            });
            const missing = this.deploymentOptions.specificMachines.filter((id) => !machines.some((value) => value.Id === id));
            if (missing.length > 0) throw CouldNotFindError.createResource("machine", missing.toString());

            specificMachineIds.push(...machines.map((m) => m.Id));
        }

        return specificMachineIds;
    }

    async getExcludedMachines() {
        const excludedMachineIds = [];
        if (this.deploymentOptions.excludeMachines.length > 0) {
            const machines = await this.repository.machines.all({
                ids: this.deploymentOptions.excludeMachines,
            });
            const missing = this.deploymentOptions.excludeMachines.filter((id) => !machines.some((value) => value.Id === id));
            if (missing.length > 0) throw CouldNotFindError.createResource("machine", missing.toString());

            excludedMachineIds.push(...machines.map((m) => m.Id));
        }

        return excludedMachineIds;
    }

    logScheduledDeployment() {
        if (this.deploymentOptions.deployAt) {
            this.client.info(`Deployment will be scheduled to start in: ${this.deploymentOptions.deployAt.toNow()}`);
        }
    }

    async createDeploymentTask(
        project: ProjectResource,
        release: ReleaseResource,
        promotionTarget: DeploymentPromotionTarget,
        specificMachineIds: string[],
        excludedMachineIds: string[],
        tenant: TenantResource | undefined = undefined
    ) {
        const preview = await this.repository.releases.getDeploymentPreview(promotionTarget);

        // Validate skipped steps
        const skip: string[] = [];
        for (const step of this.deploymentOptions.skip) {
            const stepToExecute = preview.StepsToExecute.find((s) => s.ActionName === step);
            if (stepToExecute === undefined) {
                this.client.warn(
                    `No step/action named '${step}' could be found when deploying to environment '${promotionTarget.Name}', so the step cannot be skipped.`
                );
            } else {
                this.client.debug(`Skipping step: ${stepToExecute.ActionName}`);
                skip.push(stepToExecute.ActionId);
            }
        }

        // Validate form values supplied
        if (preview.Form != null && preview.Form.Elements != null && preview.Form.Values != null)
            for (const element of preview.Form.Elements) {
                if (element.Control.Type !== ControlType.VariableValue) continue;

                const variableInput = element.Control as VariableValue;
                const value = this.deploymentOptions.variable.reduce<string | undefined>((previousValue, currentValue) => {
                    if (previousValue !== undefined) {
                        return previousValue;
                    }

                    const index =
                        [":", "="]
                            .map((s) => currentValue.indexOf(s))
                            .filter((i) => i > 0)
                            .sort((a, b) => a - b)
                            .find(() => true) ?? -1;
                    if (index <= 0) return "";

                    const variableName = currentValue.substring(0, index);
                    const variableValue = index >= currentValue.length - 1 ? "" : currentValue.substring(index + 1);

                    if (variableName === variableInput.Label) {
                        return variableValue;
                    }
                    if (variableName === variableInput.Name) {
                        return variableValue;
                    }

                    return undefined;
                }, undefined);

                if (value === undefined && element.IsValueRequired) throw new Error(`Please provide a variable for the prompted value ${variableInput.Label}`);

                preview.Form.Values[element.Name] = value as string;
            }

        // Log step with no machines
        for (const previewStep of preview.StepsToExecute) {
            if (previewStep.HasNoApplicableMachines) this.client.warn(`Warning: there are no applicable machines roles used by step ${previewStep.ActionName}`);
        }

        const deployment = await this.repository.deployments.create({
            ProjectId: project.Id,
            TenantId: tenant?.Id,
            EnvironmentId: promotionTarget.Id,
            SkipActions: skip,
            ReleaseId: release.Id,
            ForcePackageDownload: this.deploymentOptions.forcePackageDownload,
            UseGuidedFailure: preview.UseGuidedFailureModeByDefault,
            SpecificMachineIds: specificMachineIds,
            ExcludedMachineIds: excludedMachineIds,
            ForcePackageRedeployment: this.deploymentOptions.force,
            FormValues: preview.Form.Values,
            QueueTime: this.deploymentOptions.deployAt,
            QueueTimeExpiry: this.deploymentOptions.noDeployAfter,
        } as CreateDeploymentResource);

        this.client.info(
            `Deploying ${project.Name} ${release.Version} to: ${promotionTarget.Name} ${tenant === undefined ? "" : `for ${tenant.Name} `}(Guided Failure: ${
                deployment.UseGuidedFailure ? "Enabled" : "Not Enabled"
            })`
        );

        return deployment;
    }

    async deployTenantedRelease(project: ProjectResource, release: ReleaseResource): Promise<DeploymentResource[]> {
        if (this.deploymentOptions.deployTo.length !== 1) return [];

        const environment = await throwIfUndefined(
            async (nameOrId) => (await this.repository.environments.find([nameOrId])).find((v) => v),
            async (id) => this.repository.environments.get(id),
            "Environments",
            "Environment",
            this.deploymentOptions.deployTo[0]
        );

        const releaseTemplate = await this.repository.releases.getDeploymentTemplate(release);

        const deploymentTenants = await this.getTenants(project, environment.Name, release, releaseTemplate);
        const specificMachineIds = await this.getSpecificMachines();
        const excludedMachineIds = await this.getExcludedMachines();

        this.logScheduledDeployment();

        const createTasks = deploymentTenants.map(async (tenant) => {
            const promotion = releaseTemplate.TenantPromotions.find((t) => t.Id === tenant.Id)?.PromoteTo.find((tt) =>
                tt.Name.localeCompare(environment.Name, undefined, {
                    sensitivity: "accent",
                }) === 0
            );

            this.promotionTargets.push(promotion as DeploymentPromotionTarget);

            return this.createDeploymentTask(project, release, promotion as DeploymentPromotionTarget, specificMachineIds, excludedMachineIds, tenant);
        });

        return await Promise.all(createTasks);
    }

    async deployToEnvironments(project: ProjectResource, release: ReleaseResource): Promise<DeploymentResource[]> {
        if (this.deploymentOptions.deployTo.length === 0) return [];

        const releaseTemplate = await this.repository.releases.getDeploymentTemplate(release);

        const deployToEnvironments = await this.repository.environments.find(this.deploymentOptions.deployTo);

        const promotingEnvironments = deployToEnvironments.map((environment) => ({
            name: environment.Name,
            promotion: releaseTemplate.PromoteTo.find((p) => p.Name === environment.Name),
        }));

        const unknownEnvironments = promotingEnvironments.filter((p) => p.promotion === undefined);
        if (unknownEnvironments.length > 0)
            throw new Error(
                `Release '${release.Version}' of project '${project.Name}' cannot be deployed to ${
                    unknownEnvironments.length === 1
                        ? `environment '${unknownEnvironments[0].name}' because the environment is`
                        : `environments ${unknownEnvironments.map((e) => `'${e.name}'`)} because the environments are`
                } not in the list of environments that this release can be deployed to. This may be because a) the environment does not exist or is misspelled, b) The lifecycle has not reached this phase, possibly due to previous deployment failure, c) you don't have permission to deploy to this environment, or d) the environment is not in the list of environments defined by the lifecycle.`
            );

        this.logScheduledDeployment();
        const specificMachineIds = await this.getSpecificMachines();
        const excludedMachineIds = await this.getExcludedMachines();

        const createTasks = promotingEnvironments.map(async (promotion) => {
            this.promotionTargets.push(promotion.promotion as DeploymentPromotionTarget);

            return this.createDeploymentTask(project, release, promotion.promotion as DeploymentPromotionTarget, specificMachineIds, excludedMachineIds);
        });

        return await Promise.all(createTasks);
    }

    async deployRelease(project: ProjectResource, release: ReleaseResource) {
        this.deployments =
            this.deploymentOptions.tenants.length > 0 || this.deploymentOptions.tenantTags.length > 0
                ? await this.deployTenantedRelease(project, release)
                : await this.deployToEnvironments(project, release);

        if (this.deployments.length > 0 && this.deploymentOptions.waitForDeployment) {
            const waiter = new ExecutionResourceWaiter(this.repository, this.serverUrl);
            await waiter.waitForDeploymentToComplete(
                this.deployments,
                project,
                release,
                this.deploymentOptions.progress,
                this.deploymentOptions.noRawLog,
                this.deploymentOptions.rawLogFile,
                this.deploymentOptions.cancelOnTimeout,
                this.deploymentOptions.deploymentCheckSleepCycle,
                this.deploymentOptions.deploymentTimeout
            );
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
