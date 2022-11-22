import { CreateExecutionBaseV1 } from "../../createExecutionBaseV1";
import { DeploymentServerTask } from "./deploymentServerTask";

export interface CreateDeploymentTenantedCommandV1 extends CreateExecutionBaseV1 {
    ReleaseVersion: string;
    EnvironmentName: string;
    Tenants: string[];
    TenantTags: string[];
    ForcePackageRedeployment?: boolean;
    UpdateVariableSnapshot?: boolean;
}

export interface CreateDeploymentTenantedResponseV1 {
    DeploymentServerTasks: DeploymentServerTask[];
}
