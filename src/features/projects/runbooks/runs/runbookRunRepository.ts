import type { Client } from "../../../../client";
import { RunbookRun } from "./runbookRun";
import { TaskState } from "../../../serverTasks";
import { spaceScopedRoutePrefix } from "../../../../spaceScopedRoutePrefix";
import { ListArgs } from "../../../basicRepository";
import { ResourceCollection } from "../../../../resourceCollection";
import { CreateRunbookRunCommandV1, CreateRunbookRunResponseV1 } from "./createRunbookRunCommandV1";
import { lt } from "semver";
import { GitRef, Project } from "../../project";
import { RunbookRepository } from "../runbookRepository";
import { RunGitRunbookCommand } from "./RunGitRunbookCommand";
import { RunGitRunbookResponse } from "./RunGitRunbookResponse";

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
    private baseApiPathTemplate = `${spaceScopedRoutePrefix}/runbookRuns`;
    private client: Client;
    private spaceName: string;

    constructor(client: Client, spaceName: string) {
        this.client = client;
        this.spaceName = spaceName;
    }

    get(id: string): Promise<RunbookRun> {
        return this.client.request(`${this.baseApiPathTemplate}/${id}`, { spaceName: this.spaceName });
    }

    list(args?: RunbookRunListArgs): Promise<ResourceCollection<RunbookRun>> {
        return this.client.request(`${this.baseApiPathTemplate}{?skip,take,ids,projects,environments,tenants,runbooks,taskState,partialName}`, {
            spaceName: this.spaceName,
            ...args,
        });
    }

    async create(command: CreateRunbookRunCommandV1): Promise<CreateRunbookRunResponseV1> {
        const serverInformation = await this.client.getServerInformation();
        if (lt(serverInformation.version, "2022.3.5512")) {
            this.client.error?.(
                "The Octopus instance doesn't support running runbooks using the Executions API, it will need to be upgraded to at least 2022.3.5512 in order to access this API."
            );
            throw new Error(
                "The Octopus instance doesn't support running runbooks using the Executions API, it will need to be upgraded to at least 2022.3.5512 in order to access this API."
            );
        }

        this.client.debug(`Running a runbook...`);

        // WARNING: server's API currently expects there to be a SpaceIdOrName value, which was intended to allow use of names/slugs, but doesn't
        // work properly due to limitations in the middleware. For now, we'll just set it to the SpaceId
        const response = await this.client.doCreate<InternalCreateRunbookRunResponseV1>(`${spaceScopedRoutePrefix}/runbook-runs/create/v1`, {
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

    async createGit(command: RunGitRunbookCommand, gitRef: GitRef): Promise<RunGitRunbookResponse> {
        const serverInformation = await this.client.getServerInformation();
        if (lt(serverInformation.version, "2022.3.5512")) {
            this.client.error?.(
                "The Octopus instance doesn't support running runbooks using the Executions API, it will need to be upgraded to at least 2022.3.5512 in order to access this API."
            );
            throw new Error(
                "The Octopus instance doesn't support running runbooks using the Executions API, it will need to be upgraded to at least 2022.3.5512 in order to access this API."
            );
        }

        this.client.debug(`Running a runbook...`);

        // WARNING: server's API currently expects there to be a SpaceIdOrName value, which was intended to allow use of names/slugs, but doesn't
        // work properly due to limitations in the middleware. For now, we'll just set it to the SpaceId
        const response = await this.client.doCreate<InternalCreateRunbookRunResponseV1>(`${spaceScopedRoutePrefix}/runbook-runs/git/create/v1`, {
            spaceIdOrName: command.spaceName,
            gitRef: gitRef,
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
