import { Client } from "../../../client";
import { CreateRunbookRunCommandV1, CreateRunbookRunResponseV1 } from "./createRunbookRunCommandV1";

export async function runRunbook(client: Client, command: CreateRunbookRunCommandV1): Promise<CreateRunbookRunResponseV1> {
    client.debug(`Running a runbook...`);

    // WARNING: server's API currently expects there to be a SpaceIdOrName value, which was intended to allow use of names/slugs, but doesn't
    // work properly due to limitations in the middleware. For now, we'll just set it to the SpaceId
    var response = await client.do<CreateRunbookRunResponseV1>("~/api/{spaceId}/runbook-runs/create/v1", {
        spaceIdOrName: command.spaceName,
        ...command,
    });

    if (response.runbookRunServerTasks.length == 0) {
        throw new Error('No server task details returned')
    }

    client.debug(`Runbook executed successfully. [${response.runbookRunServerTasks.map(t => t.serverTaskId).join(', ')}]`);

    return response;
}
