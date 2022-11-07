import { OctopusSpaceRepository } from "../../../repository";
import { CreateRunbookRunCommandV1, CreateRunbookRunResponseV1 } from "./createRunbookRunCommandV1";

export async function runRunbook(repository: OctopusSpaceRepository, command: CreateRunbookRunCommandV1): Promise<CreateRunbookRunResponseV1> {
    console.log(`Running a runbook...`);

    // WARNING: server's API currently expects there to be a SpaceIdOrName value, which was intended to allow use of names/slugs, but doesn't
    // work properly due to limitations in the middleware. For now, we'll just set it to the SpaceId
    var response = await repository.client.do<CreateRunbookRunResponseV1>("~/api/{spaceId}/runbook-runs/create/v1", {
        spaceIdOrName: command.spaceId,
        ...command,
    });

    console.log(`Runbook executed successfully.`);

    return response;
}
