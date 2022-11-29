import { Execution, NewExecution } from "../../execution";
import { ReleaseChanges } from "../releaseChanges";

export interface Deployment extends Execution {
    ReleaseId: string;
    Changes: ReleaseChanges[];
    ChangesMarkdown: string;
    DeploymentProcessId: string;
    ChannelId: string;
    ForcePackageRedeployment: boolean;
}
