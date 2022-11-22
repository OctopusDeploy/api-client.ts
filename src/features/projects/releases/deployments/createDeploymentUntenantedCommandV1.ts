import { CreateExecutionBaseV1 } from "../../createExecutionBaseV1";
import { DeploymentServerTask } from "./deploymentServerTask";

export interface CreateDeploymentUntenantedCommandV1 extends CreateExecutionBaseV1 {
    ReleaseVersion: string;
    EnvironmentNames: string[];
    ForcePackageRedeployment?: boolean;
    UpdateVariableSnapshot?: boolean;
}

export interface CreateDeploymentUntenantedResponseV1 {
    DeploymentServerTasks: DeploymentServerTask[];
}
