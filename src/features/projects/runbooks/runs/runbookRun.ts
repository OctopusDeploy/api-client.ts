import { Execution, NewExecution } from "../../execution";

export interface RunbookRun extends Execution {
    RunbookSnapshotId: string;
    RunbookId: string;
    FrozenRunbookProcessId: string;
}

export interface CreateRunbookRunRequest extends NewExecution {
    RunbookSnapshotId: string;
    RunbookId: string;
    FrozenRunbookProcessId: string;
}
