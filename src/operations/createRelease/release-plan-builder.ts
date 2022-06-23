import {
    ChannelResource,
    DeploymentProcessResource,
    FeedResource,
    PackageResource,
    ProjectResource,
    ReleaseTemplateResource,
} from "@octopusdeploy/message-contracts";
import { Client, OctopusSpaceRepository } from "../../";
import { CouldNotFindError } from "../could-not-find-error";
import { IChannelVersionRuleTester } from "./channel-version-rule-tester";
import { IPackageVersionResolver } from "./package-version-resolver";
import { ReleasePlan } from "./release-plan";
import { ReleasePlanItem } from "./release-plan-item";

const GitReferenceMissingForVersionControlledProjectErrorMessage =
    "Attempting to create a release for a version controlled project, but no git reference has been provided. Use the gitRef parameter to supply a git reference.";

export class ReleasePlanBuilder {
    static gitReferenceSuppliedForDatabaseProjectErrorMessage(gitObjectName: string) {
        return `Attempting to create a release from version control because the git ${gitObjectName} was provided. The selected project is not a version controlled project.`;
    }

    constructor(readonly client: Client, readonly versionResolver: IPackageVersionResolver, readonly channelVersionRuleTester: IChannelVersionRuleTester) {}

    private static async loadFeedsForSteps(repository: OctopusSpaceRepository, project: ProjectResource, steps: ReleasePlanItem[]) {
        // PackageFeedId can be an id or a name
        const allRelevantFeedIdOrName = steps.map((step) => step.packageFeedId).filter((feedId): feedId is string => feedId !== undefined);

        const allRelevantFeeds = await repository.feeds.list({
            ids: allRelevantFeedIdOrName,
            take: repository.feeds.takeAll,
        });

        return new Map(project.IsVersionControlled ? allRelevantFeeds.Items.map((p) => [p.Name, p]) : allRelevantFeeds.Items.map((p) => [p.Id, p]));
    }

    private buildChannelVersionFilters(stepName: string, packageReferenceName: string, channel: ChannelResource | undefined) {
        const filters: { [p: string]: string } = {};

        if (channel === undefined) return filters;

        const rule = channel.Rules.find((r) =>
            r.ActionPackages.some(
                (pkg) =>
                    pkg.DeploymentAction.localeCompare(stepName, undefined, {
                        sensitivity: "accent",
                    }) === 0 &&
                    pkg.PackageReference?.localeCompare(packageReferenceName, undefined, {
                        sensitivity: "accent",
                    }) === 0
            )
        );

        if (rule === null || rule === undefined) return filters;

        if (!rule.VersionRange) filters["versionRange"] = rule.VersionRange;

        if (!rule.Tag) filters["preReleaseTag"] = rule.Tag;

        return filters;
    }

    async build(
        repository: OctopusSpaceRepository,
        project: ProjectResource,
        channel: ChannelResource | undefined,
        versionPreReleaseTag: string | undefined,
        gitReference: string | undefined,
        gitCommit: string | undefined
    ) {
        return !gitReference
            ? await this.buildReleaseFromDatabase(repository, project, channel, versionPreReleaseTag)
            : await this.buildReleaseFromVersionControl(repository, project, channel as ChannelResource, versionPreReleaseTag, gitReference, gitCommit);
    }

    async buildReleaseFromDatabase(
        repository: OctopusSpaceRepository,
        project: ProjectResource,
        channel: ChannelResource | undefined,
        versionPreReleaseTag: string | undefined
    ) {
        if (project.IsVersionControlled) throw new Error(GitReferenceMissingForVersionControlledProjectErrorMessage);

        console.debug("Finding deployment process...");
        const deploymentProcess = await repository.deploymentProcesses.get(project.DeploymentProcessId, undefined);
        if (deploymentProcess === undefined) throw new CouldNotFindError(`a deployment process for project ${project.Name}`);

        console.debug("Finding release template...");
        const releaseTemplate = await repository.deploymentProcesses.getTemplate(deploymentProcess, channel);
        if (releaseTemplate === undefined)
            throw new CouldNotFindError(
                channel ? `a release template for project ${project.Name} and channel ${channel.Name}` : `a release template for project ${project.Name}`
            );

        return await this.buildInternal(repository, project, channel, versionPreReleaseTag, releaseTemplate, deploymentProcess);
    }

    async buildReleaseFromVersionControl(
        repository: OctopusSpaceRepository,
        project: ProjectResource,
        channel: ChannelResource,
        versionPreReleaseTag: string | undefined,
        gitReference: string | undefined,
        gitCommit: string | undefined
    ) {
        const gitObject = !gitCommit ? gitReference : gitCommit;
        const gitObjectName = !gitCommit ? `reference ${gitReference}` : `commit ${gitCommit}`;

        if (!project.IsVersionControlled) throw new Error(ReleasePlanBuilder.gitReferenceSuppliedForDatabaseProjectErrorMessage(gitObjectName));

        console.debug(`Finding deployment process at git ${gitObjectName}...`);
        const deploymentProcess = await repository.deploymentProcesses.get(project.DeploymentProcessId, gitObject);
        if (deploymentProcess === undefined) throw new CouldNotFindError(`a deployment process for project ${project.Name} and git ${gitObjectName}`);

        console.debug(`Finding release template at git ${gitObjectName}...`);
        const releaseTemplate = await repository.deploymentProcesses.getTemplate(deploymentProcess, channel);
        if (releaseTemplate === undefined)
            throw new CouldNotFindError(`a release template for project ${project.Name}, channel ${channel.Name} and git ${gitObjectName}`);

        return await this.buildInternal(repository, project, channel, versionPreReleaseTag, releaseTemplate, deploymentProcess);
    }

    private async buildInternal(
        repository: OctopusSpaceRepository,
        project: ProjectResource,
        channel: ChannelResource | undefined,
        versionPreReleaseTag: string | undefined,
        releaseTemplate: ReleaseTemplateResource,
        deploymentProcess: DeploymentProcessResource
    ) {
        const plan = new ReleasePlan(project, channel, releaseTemplate, deploymentProcess, this.versionResolver);

        if (plan.unresolvedSteps.length > 0) {
            console.debug("The package version for some steps was not specified. Attempting to resolve those automatically...");

            const allRelevantFeeds = await ReleasePlanBuilder.loadFeedsForSteps(repository, project, plan.unresolvedSteps);

            for (const unresolved of plan.unresolvedSteps) {
                if (!unresolved.isResolvable) {
                    console.error(
                        `The version number for step, '${unresolved.actionName}' cannot be automatically resolved because the feed or package ID is dynamic.`
                    );
                    continue;
                }

                if (versionPreReleaseTag)
                    console.debug(`Finding latest package with pre-release '${versionPreReleaseTag}' for step, ${unresolved.actionName}...`);
                else console.debug(`Finding latest package for step, ${unresolved.actionName}...`);

                if (!allRelevantFeeds.has(unresolved.packageFeedId as string)) {
                    throw new Error(`Could not find a feed with ID ${unresolved.packageFeedId}, which is used by step: ${unresolved.actionName}`);
                }
                const feed = allRelevantFeeds.get(unresolved.packageFeedId as string) as FeedResource;
                const filters = this.buildChannelVersionFilters(unresolved.actionName, unresolved.packageReferenceName as string, channel);
                filters["packageId"] = unresolved.packageId as string;
                if (versionPreReleaseTag) filters["preReleaseTag"] = versionPreReleaseTag;

                const packages = await this.client.get<PackageResource[]>(feed.Links.SearchTemplate, filters);
                const latestPackage = packages[0];

                if (packages.length === 0) {
                    console.info(`Could not find any packages with ID '${unresolved.packageId}' that match the channel filter, in the feed '${feed.Name}'`);
                } else {
                    console.debug(`Selected '${latestPackage.PackageId}' version '${latestPackage.Version}' for '${unresolved.actionName}'`);
                    unresolved.setVersionFromLatest(latestPackage.Version);
                }
            }
        }

        // Test each step in this plan satisfies the channel version rules
        if (channel !== undefined)
            for (const step of plan.packageSteps) {
                // Note the rule can be null, meaning: anything goes
                const rule = channel.Rules.find((r) =>
                    r.ActionPackages.some(
                        (pkg) =>
                            pkg.DeploymentAction.localeCompare(step.actionName, undefined, {
                                sensitivity: "accent",
                            }) === 0 &&
                            pkg.PackageReference?.localeCompare(step.packageReferenceName as string, undefined, {
                                sensitivity: "accent",
                            }) === 0
                    )
                );
                const result = await this.channelVersionRuleTester.test(rule, step.version, step.packageFeedId);
                step.setChannelVersionRuleTestResult(result);
            }

        return plan;
    }
}
