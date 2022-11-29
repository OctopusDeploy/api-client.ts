import type { Client } from "../../../../client";
import { ListArgs, SpaceScopedBasicRepository } from "../../..";
import { RunbookRun } from "./runbookRun";
import { TaskState } from "../../../serverTasks";

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
        super(client, spaceName, "~/api/{spaceId}/runbookRuns{/id}{?skip,take,ids,projects,environments,tenants,runbooks,taskState,partialName}");
    }
}
