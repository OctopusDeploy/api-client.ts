import type { DashboardResource } from "@octopusdeploy/message-contracts";
import type { Client } from "../client";

export class DashboardRepository {
    private client: Client;
    constructor(client: Client) {
        this.client = client;
    }

    getDeploymentsCountedByWeek(projectIds: string[]) {
        return this.client.get(this.client.getLink("Reporting/DeploymentsCountedByWeek"), { projectIds: projectIds.join(",") });
    }

    getDashboard(dashboardFilter?: DashboardFilter): Promise<DashboardResource> {
        return this.client.get<DashboardResource>(this.client.getLink("Dashboard"), dashboardFilter);
    }

    getDynamicDashboard(
        projects: string[],
        environments: string[],
        dashboardItemsOptions: DashboardItemsOptions = DashboardItemsOptions.IncludeCurrentDeploymentOnly
    ): Promise<DashboardResource> {
        return this.client.get<DashboardResource>(this.client.getLink("DashboardDynamic"), {
            projects: projects,
            environments: environments,
            includePrevious: dashboardItemsOptions === DashboardItemsOptions.IncludeCurrentAndPreviousSuccessfulDeployment,
        });
    }
}

export type DashboardFilter = {
    highestLatestVersionPerProjectAndEnvironment?: boolean;
    projectId?: string;
    releaseId?: string;
    showAll?: boolean;
};

export enum DashboardItemsOptions {
    IncludeCurrentDeploymentOnly,
    IncludeCurrentAndPreviousSuccessfulDeployment,
}
