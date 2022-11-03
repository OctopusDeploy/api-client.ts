import { OctopusSpaceRepository } from "../../../repository";
import { CreateRunbookRunCommandV1, CreateRunbookRunResponseV1 } from "./createRunbookRunCommandV1";

export async function runRunbook(repository: OctopusSpaceRepository, command: CreateRunbookRunCommandV1): Promise<CreateRunbookRunResponseV1> {
    console.log(`Running a runbook...`);

    var response = await repository.client.do<CreateRunbookRunResponseV1>("~/api/{spaceId}/runbook-runs/create/v1", command);

    console.log(`Runbook executed successfully.`);

    return response;
}
