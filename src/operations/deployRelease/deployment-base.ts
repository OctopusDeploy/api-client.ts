import {
    CreateDeploymentResource,
    DeploymentPromotionTarget,
    DeploymentResource,
    DeploymentTemplateResource,
    ProjectResource,
    ReleaseResource,
    TenantResource,
} from "@octopusdeploy/message-contracts";
import { ControlType, VariableValue } from "@octopusdeploy/message-contracts/dist/form";
import moment from "moment";
import { Client } from "../../client";
import { OctopusSpaceRepository } from "../../repository";
import { CouldNotFindError } from "../could-not-find-error";
import { throwIfUndefined } from "../throw-if-undefined";
import { DeploymentOptions } from "./deployment-options";
import { ExecutionResourceWaiter } from "./execution-resource-waiter";

function deploymentOptionsDefaults(): DeploymentOptions {
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
        skipStepNames: [],
        specificMachines: [],
        tenantTags: [],
        tenants: [],
        variable: [],
        waitForDeployment: false,
    };
}

export abstract class DeploymentBase {
    private deployments: DeploymentResource[] = [];
    private promotionTargets: DeploymentPromotionTarget[] = [];
    protected readonly deploymentOptions: DeploymentOptions;

    protected constructor(
        protected readonly client: Client,
        protected readonly repository: OctopusSpaceRepository,
        private readonly serverUrl: string,
        deploymentConfiguration?: Partial<DeploymentOptions>
    ) {
        this.deploymentOptions = {
            ...deploymentOptionsDefaults(),
            ...deploymentConfiguration,
        };
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

    private async getTenants(project: ProjectResource, environmentName: string, release: ReleaseResource, releaseTemplate: DeploymentTemplateResource) {
        if (this.deploymentOptions.tenants.length === 0 && this.deploymentOptions.tenantTags.length === 0) return [];

        const deployableTenants: TenantResource[] = [];

        if (this.deploymentOptions.tenants.some((t) => t === "*")) {
            const tenantPromotions = releaseTemplate.TenantPromotions.filter((tp) =>
                tp.PromoteTo.some(
                    (promo) =>
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
                        return (
                            tenantPromo === undefined ||
                            !tenantPromo?.PromoteTo.some(
                                (tdt) =>
                                    tdt.Name.localeCompare(environmentName, undefined, {
                                        sensitivity: "accent",
                                    }) === 0
                            )
                        );
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
                        tenantPromo.PromoteTo.some(
                            (tdt) =>
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

    private async getSpecificMachines() {
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

    private async getExcludedMachines() {
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

    private logScheduledDeployment() {
        if (this.deploymentOptions.deployAt) {
            this.client.info(`Deployment will be scheduled to start at ${this.deploymentOptions.deployAt.toLocaleString()}`);
        }
    }

    private async createDeploymentTask(
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
        for (const step of this.deploymentOptions.skipStepNames) {
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
        if (preview.Form !== null && preview.Form.Elements !== null && preview.Form.Values !== null)
            for (const element of preview.Form.Elements) {
                if (element.Control.Type !== ControlType.VariableValue) continue;

                const variableInput = element.Control as VariableValue;
                const value = this.deploymentOptions.variable.reduce<string | undefined>((previousValue, currentValue) => {
                    if (previousValue !== undefined) {
                        return previousValue;
                    }

                    const variableName = currentValue.name;
                    const variableValue = currentValue.value;

                    if (variableName === variableInput.Label) {
                        return variableValue.toString();
                    }
                    if (variableName === variableInput.Name) {
                        return variableValue.toString();
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
            QueueTime: this.deploymentOptions.deployAt ? moment(this.deploymentOptions.deployAt) : undefined,
            QueueTimeExpiry: this.deploymentOptions.noDeployAfter ? moment(this.deploymentOptions.noDeployAfter) : undefined,
        } as CreateDeploymentResource);

        this.client.info(
            `Deploying ${project.Name} ${release.Version} to: ${promotionTarget.Name} ${tenant === undefined ? "" : `for ${tenant.Name} `}(Guided Failure: ${
                deployment.UseGuidedFailure ? "Enabled" : "Not Enabled"
            })`
        );

        return deployment;
    }

    private async deployTenantedRelease(project: ProjectResource, release: ReleaseResource): Promise<DeploymentResource[]> {
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
            const promotion = releaseTemplate.TenantPromotions.find((t) => t.Id === tenant.Id)?.PromoteTo.find(
                (tt) =>
                    tt.Name.localeCompare(environment.Name, undefined, {
                        sensitivity: "accent",
                    }) === 0
            );

            this.promotionTargets.push(promotion as DeploymentPromotionTarget);

            return this.createDeploymentTask(project, release, promotion as DeploymentPromotionTarget, specificMachineIds, excludedMachineIds, tenant);
        });

        return await Promise.all(createTasks);
    }

    private async deployToEnvironments(project: ProjectResource, release: ReleaseResource): Promise<DeploymentResource[]> {
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
}
