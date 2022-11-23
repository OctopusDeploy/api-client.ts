import type { Client } from "../../../../client";
import type { TaskState } from "@octopusdeploy/message-contracts";
import { ListArgsV2, SpaceScopedBasicRepositoryV2 } from "../../..";
import { RunbookRun } from "./runbookRun";

type RunbookRunListArgs = {
    ids?: string[];
    projects?: string[];
    environments?: string[];
    tenants?: string[];
    runbooks?: string[];
    taskState?: TaskState;
    partialName: string;
} & ListArgsV2;

export class RunbookRunRepository extends SpaceScopedBasicRepositoryV2<RunbookRun, RunbookRun, RunbookRunListArgs> {
    constructor(client: Client, spaceName: string) {
        super(client, spaceName, "~/api/{spaceId}/runbookRuns{/id}{?skip,take,ids,projects,environments,tenants,runbooks,taskState,partialName}");
    }
}
