import { SpaceResource } from "@octopusdeploy/message-contracts";
import { Client } from "../client";
import { processConfiguration } from "../clientConfiguration.test";
import { OctopusSpaceRepository, Repository } from "../repository";

export async function connect(space: SpaceResource): Promise<[repository: OctopusSpaceRepository, client: Client]> {
    const client = await Client.create(processConfiguration());
    if (client === undefined) {
        throw new Error("The API client failed initialize");
    }

    const repository = await new Repository(client).forSpace(space);
    return [repository, client];
}
