import { Execution, NewExecution } from "../../execution";
import { ReleaseChanges } from "../releaseChanges";

export interface Deployment extends Execution {
    releaseId: string;
    changes: ReleaseChanges[];
    changesMarkdown: string;
    deploymentProcessId: string;
    channelId: string;
    forcePackageRedeployment: boolean;
}

export interface NewDeployment extends NewExecution {
    releaseId: string;
    channelId?: string;
    deploymentProcessId?: string;
    environmentId: string;
    forcePackageRedeployment?: boolean;
  }
