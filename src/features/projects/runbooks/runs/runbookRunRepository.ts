import type { Client } from "../../../../client";
import { RunbookRun } from "./runbookRun";
import { TaskState } from "../../../serverTasks";
import { spaceScopedRoutePrefix } from "../../../../spaceScopedRoutePrefix";
import { ListArgs } from "../../../basicRepository";
import { ResourceCollection } from "../../../../resourceCollection";
import { CreateRunbookRunCommandV1, CreateRunbookRunResponseV1 } from "./createRunbookRunCommandV1";

// WARNING: we've had to do this to cover a mistake in Octopus' API. The API has been corrected to return PascalCase, but was returning camelCase
// for a number of versions, so we'll deserialize both and use whichever actually has a value
interface InternalRunbookRunServerTask {
    RunbookRunId: string;
    runbookRunId: string;
    ServerTaskId: string;
    serverTaskId: string;
}

interface InternalCreateRunbookRunResponseV1 {
    RunbookRunServerTasks: InternalRunbookRunServerTask[];
}

type RunbookRunListArgs = {
    ids?: string[];
    projects?: string[];
    environments?: string[];
    tenants?: string[];
    runbooks?: string[];
    taskState?: TaskState;
    partialName?: string;
} & ListArgs;

export class RunbookRunRepository {
    private baseApiTemplate = `${spaceScopedRoutePrefix}/runbookRuns{/id}{?skip,take,ids,projects,environments,tenants,runbooks,taskState,partialName}`;
    private client: Client;
    private spaceName: string;

    constructor(client: Client, spaceName: string) {
        this.client = client;
        this.spaceName = spaceName;
    }

    async get(id: string): Promise<RunbookRun> {
        return await this.client.request(this.baseApiTemplate, { id, spaceName: this.spaceName });
    }

    async list(args?: RunbookRunListArgs): Promise<ResourceCollection<RunbookRun>> {
        return await this.client.request(this.baseApiTemplate, { spaceName: this.spaceName, ...args });
    }

    async create(command: CreateRunbookRunCommandV1): Promise<CreateRunbookRunResponseV1> {
        this.client.debug(`Running a runbook...`);

        // WARNING: server's API currently expects there to be a SpaceIdOrName value, which was intended to allow use of names/slugs, but doesn't
        // work properly due to limitations in the middleware. For now, we'll just set it to the SpaceId
        const response = await this.client.doCreate<InternalCreateRunbookRunResponseV1>("runbook-runs/create/v1", {
            spaceIdOrName: command.spaceName,
            ...command,
        });

        if (response.RunbookRunServerTasks.length == 0) {
            throw new Error("No server task details returned");
        }

        const mappedTasks = response.RunbookRunServerTasks.map((x) => {
            return {
                RunbookRunId: x.RunbookRunId || x.runbookRunId,
                ServerTaskId: x.ServerTaskId || x.serverTaskId,
            };
        });

        this.client.debug(`Runbook executed successfully. [${mappedTasks.map((t) => t.ServerTaskId).join(", ")}]`);

        return {
            RunbookRunServerTasks: mappedTasks,
        };
    }
}
