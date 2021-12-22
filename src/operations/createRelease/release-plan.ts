import {
  ChannelResource,
  DeploymentProcessResource,
  ProjectResource,
  ReleaseTemplateResource,
  SelectedPackage
} from '@octopusdeploy/message-contracts';
import { IPackageVersionResolver } from './package-version-resolver';
import { ReleasePlanItem } from './release-plan-item';

export class ReleasePlan {
  readonly packageSteps: ReleasePlanItem[];
  readonly scriptSteps: ReleasePlanItem[];

  constructor(
    readonly project: ProjectResource,
    readonly channel: ChannelResource | undefined,
    readonly releaseTemplate: ReleaseTemplateResource,
    deploymentProcess: DeploymentProcessResource,
    private versionResolver: IPackageVersionResolver
  ) {
    this.scriptSteps = deploymentProcess.Steps.flatMap(s => s.Actions)
      .map(a => ({
        stepName: a.Name,
        packageId: a.Properties['Octopus.Action.Package.PackageId'] ?? '',
        feedId: a.Properties['Octopus.Action.Package.FeedId'] ?? '',
        isDisabled: a.IsDisabled,
        channels: a.Channels
      }))
      .filter(x => !x.packageId && !x.isDisabled) // only consider enabled script steps
      .filter(
        a =>
          a.channels.length === 0 || a.channels.find(id => id === channel?.Id)
      ) // only include actions without channel scope or with a matching channel scope
      .map(x => {
        const releasePlanItem = new ReleasePlanItem(
          x.stepName,
          undefined,
          undefined,
          undefined,
          true,
          undefined
        );

        releasePlanItem.isDisabled = x.isDisabled;
        return releasePlanItem;
      });

    this.packageSteps = releaseTemplate.Packages.map(
      p =>
        new ReleasePlanItem(
          p.ActionName,
          p.PackageReferenceName,
          p.PackageId,
          p.FeedId,
          p.IsResolvable,
          versionResolver.resolveVersion(
            p.ActionName,
            p.PackageId,
            p.PackageReferenceName
          )
        )
    );
  }

  get unresolvedSteps() {
    return this.packageSteps.filter(s => !s.version);
  }

  channelHasAnyEnabledSteps() {
    return (
      ReleasePlan.anyEnabled(this.packageSteps) ||
      ReleasePlan.anyEnabled(this.scriptSteps)
    );
  }

  private static anyEnabled(items: ReleasePlanItem[]) {
    return items.some(x => !x.isDisabled);
  }

  isViableReleasePlan() {
    return (
      !this.hasUnresolvedSteps() &&
      !this.hasStepsViolatingChannelVersionRules() &&
      this.channelHasAnyEnabledSteps()
    );
  }

  hasUnresolvedSteps() {
    return this.unresolvedSteps.length > 0;
  }

  hasStepsViolatingChannelVersionRules() {
    return (
      this.channel !== undefined &&
      this.packageSteps.some(
        s => s.channelVersionRuleTestResult?.isSatisfied !== true
      )
    );
  }

  formatAsTable() {
    return undefined;
  }

  getActionVersionNumber(
    packageStepName: string,
    packageReferenceName: string | undefined
  ) {
    const step = this.packageSteps.find(
      s =>
        s.actionName.localeCompare(packageStepName, undefined, {
          sensitivity: 'accent'
        }) === 0 &&
        (!s.packageReferenceName ||
          s.packageReferenceName.localeCompare(
            packageReferenceName ?? '',
            undefined,
            { sensitivity: 'accent' }
          ) === 0)
    );
    if (step === undefined)
      throw new Error(
        `The step '${packageStepName}' is configured to provide the package version number but doesn't exist in the release plan.`
      );
    if (!step.version)
      throw new Error(
        `The step '${packageStepName}' provides the release version number but no package version could be determined from it.`
      );
    return step.version;
  }

  getSelections(): SelectedPackage[] {
    return this.packageSteps.map(x => ({
      ActionName: x.actionName,
      PackageReferenceName: x.packageReferenceName,
      Version: x.version as string
    }));
  }
}
