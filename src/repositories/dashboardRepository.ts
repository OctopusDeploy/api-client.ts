import type { DashboardResource } from "@octopusdeploy/message-contracts";
import type { Client } from "../client";

class DashboardRepository {
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
}

export type DashboardFilter = {
    projectId?: string;
    releaseId?: string;
    showAll?: boolean;
    highestLatestVersionPerProjectAndEnvironment?: boolean;
};

export default DashboardRepository;
