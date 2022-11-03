import { CreateExecutionBaseV1 } from "../createExecutionBaseV1";
import { DeploymentServerTask } from "./deploymentServerTask";

export interface CreateDeploymentTenantedCommandV1 extends CreateExecutionBaseV1 {
    releaseVersion: string;
    environmentName: string;
    tenants: string[];
    tenantTags: string[];
    forcePackageRedeployment?: boolean;
    updateVariableSnapshot?: boolean;
}

export interface CreateDeploymentTenantedResponseV1 {
    deploymentServerTasks: DeploymentServerTask[];
}
