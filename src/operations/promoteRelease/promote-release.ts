import { ClientConfiguration } from "../../clientConfiguration";
import { connect } from "../connect";
import { throwIfUndefined } from "../throw-if-undefined";
import { DashboardItemResource, EnvironmentResource, ProjectResource, TaskState } from "@octopusdeploy/message-contracts";
import { Client } from "../../client";
import { OctopusSpaceRepository } from "../../repository";
import { SemVer } from "semver";
import { CouldNotFindError } from "../could-not-find-error";
import { DeploymentOptions } from "../deployRelease/deployment-options";
import { DeploymentBase } from "../deployRelease/deployment-base";
import { DashboardItemsOptions } from "../../repositories/dashboardRepository";

export async function promoteRelease(
    configuration: ClientConfiguration,
    space: string,
    project: string,
    from: string,
    deployTo: string[],
    lastSuccessful?: boolean | undefined,
    updateVariables?: boolean | undefined,
    deploymentOptions?: Partial<DeploymentOptions>
): Promise<void> {
    const [repository, client] = await connect(configuration, space);

    const proj = await throwIfUndefined<ProjectResource>(
        async (nameOrId) => repository.projects.find(nameOrId),
        async (id) => repository.projects.get(id),
        "Projects",
        "project",
        project
    );

    await new PromoteRelease(client, repository, configuration.apiUri, proj, deployTo, deploymentOptions).execute(from, lastSuccessful, updateVariables);
}

class PromoteRelease extends DeploymentBase {
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

    async execute(from: string, useLatestSuccessfulRelease: boolean | undefined = false, updateVariables: boolean | undefined = false) {
        const environment = await throwIfUndefined<EnvironmentResource>(
            async (nameOrId) => {
                const results = await this.repository.environments.find([nameOrId]);
                return results.length > 0 ? results[0] : undefined;
            },
            async (id) => this.repository.environments.get(id),
            "Environments",
            "environment",
            from
        );
        const dashboardItemsOptions = useLatestSuccessfulRelease
            ? DashboardItemsOptions.IncludeCurrentAndPreviousSuccessfulDeployment
            : DashboardItemsOptions.IncludeCurrentDeploymentOnly;
        const dashboard = await this.repository.dashboards.getDynamicDashboard([this.project.Id], [environment.Id], dashboardItemsOptions);

        const compareFn = (r1: DashboardItemResource, r2: DashboardItemResource) => {
            const r1Version = new SemVer(r1.ReleaseVersion);
            const r2Version = new SemVer(r2.ReleaseVersion);

            return r1Version.compare(r2Version);
        };

        const dashboardItems = dashboard.Items.filter((e) => e.EnvironmentId === environment.Id && e.ProjectId === this.project.Id).sort(compareFn);

        const dashboardItem = useLatestSuccessfulRelease ? dashboardItems.filter((x) => x.State === TaskState.Success).at(0) : dashboardItems.at(0);

        if (dashboardItem === undefined) {
            const deploymentType = useLatestSuccessfulRelease ? "successful " : "";

            throw new CouldNotFindError(
                `latest ${deploymentType}deployment of the project for this environment. Please check that a ${deploymentType} deployment for this project/environment exists on the dashboard.`
            );
        }

        this.client.debug(`Finding release details for release ${dashboardItem.ReleaseVersion}`);

        const release = await this.repository.projects.getReleaseByVersion(this.project, dashboardItem.ReleaseVersion);

        if (updateVariables) {
            this.client.debug("Updating the release variable snapshot with variables from the project");
            await this.repository.releases.snapshotVariables(release);
        }
        await this.deployRelease(this.project, release);
    }
}
