import { CreateExecutionBaseV1 } from "../createExecutionBaseV1";
import { DeploymentServerTask } from "./deploymentServerTask";

export interface CreateDeploymentUntenantedCommandV1 extends CreateExecutionBaseV1 {
    releaseVersion: string;
    environmentNames: string[];
    forcePackageRedeployment?: boolean;
    updateVariableSnapshot?: boolean;
}

export interface CreateDeploymentUntenantedResponseV1 {
    deploymentServerTasks: DeploymentServerTask[];
}
