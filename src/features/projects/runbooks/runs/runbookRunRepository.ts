import type { Client } from "../../../../client";
import { RunbookRun } from "./runbookRun";
import { TaskState } from "../../../serverTasks";
import { spaceScopedRoutePrefix } from "../../../../spaceScopedRoutePrefix";
import { ListArgs } from "../../../basicRepository";
import { SpaceScopedBasicRepository } from "../../../spaceScopedBasicRepository";

type RunbookRunListArgs = {
    ids?: string[];
    projects?: string[];
    environments?: string[];
    tenants?: string[];
    runbooks?: string[];
    taskState?: TaskState;
    partialName?: string;
} & ListArgs;

export class RunbookRunRepository extends SpaceScopedBasicRepository<RunbookRun, RunbookRun, RunbookRunListArgs> {
    constructor(client: Client, spaceName: string) {
        super(client, spaceName, `${spaceScopedRoutePrefix}/runbookRuns{/id}{?skip,take,ids,projects,environments,tenants,runbooks,taskState,partialName}`);
    }
}
