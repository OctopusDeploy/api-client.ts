import { CreateExecutionBaseV1 } from "../createExecutionBaseV1";
import { RunbookRunServerTask } from "./runbookRunServerTask";

export interface CreateRunbookRunCommandV1 extends CreateExecutionBaseV1 {
    runbookName: string;
    environmentNames: string[];
    tenants?: string[];
    tenantTags?: string[];
    snapshot?: string;
}

export interface CreateRunbookRunResponseV1 {
    runbookRunServerTasks: RunbookRunServerTask[];
}
