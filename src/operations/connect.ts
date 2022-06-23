import { SpaceResource } from "@octopusdeploy/message-contracts";
import { Client } from "../client";
import { OctopusSpaceRepository, Repository } from "../repository";

export async function connect(space: SpaceResource): Promise<[repository: OctopusSpaceRepository, client: Client]> {
    const client = await Client.create();
    if (client === undefined) {
        throw new Error("The API client failed initialize");
    }

    const repository = await new Repository(client).forSpace(space);
    return [repository, client];
}
