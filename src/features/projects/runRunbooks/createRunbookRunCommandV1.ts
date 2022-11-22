import { CreateExecutionBaseV1 } from "../createExecutionBaseV1";
import { RunbookRunServerTask } from "./runbookRunServerTask";

export interface CreateRunbookRunCommandV1 extends CreateExecutionBaseV1 {
    RunbookName: string;
    EnvironmentNames: string[];
    Tenants?: string[];
    TenantTags?: string[];
    Snapshot?: string;
}

export interface CreateRunbookRunResponseV1 {
    RunbookRunServerTasks: RunbookRunServerTask[];
}
