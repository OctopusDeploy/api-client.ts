import type { RunbookRunResource, TaskState } from "@octopusdeploy/message-contracts";
import type { ListArgs } from "./basicRepository";
import BasicRepository from "./basicRepository";
import type { Client } from "../client";

type RunbookRunListArgs = {
    projects?: string[];
    environments?: string[];
    tenants?: string[];
    runbooks?: string[];
    channels?: string[];
    taskState?: TaskState;
} & ListArgs;

class RunbookRunRepository extends BasicRepository<RunbookRunResource, RunbookRunResource, RunbookRunListArgs> {
    constructor(client: Client) {
        super("RunbookRuns", client);
    }
}

export default RunbookRunRepository;
