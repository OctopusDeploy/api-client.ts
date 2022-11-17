import { Execution } from "../../execution";
import { ReleaseChanges } from "../releaseChanges";

export interface Deployment extends Execution {
    changes: ReleaseChanges[];
    changesMarkdown: string;
}
