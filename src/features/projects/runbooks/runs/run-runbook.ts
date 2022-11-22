import { Client } from "../../../client";
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

export async function runRunbook(client: Client, command: CreateRunbookRunCommandV1): Promise<CreateRunbookRunResponseV1> {
    client.debug(`Running a runbook...`);

    // WARNING: server's API currently expects there to be a SpaceIdOrName value, which was intended to allow use of names/slugs, but doesn't
    // work properly due to limitations in the middleware. For now, we'll just set it to the SpaceId
    const response = await client.doCreate<InternalCreateRunbookRunResponseV1>("~/api/{spaceId}/runbook-runs/create/v1", {
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

    client.debug(`Runbook executed successfully. [${mappedTasks.map((t) => t.ServerTaskId).join(", ")}]`);

    return {
        RunbookRunServerTasks: mappedTasks,
    };
}
