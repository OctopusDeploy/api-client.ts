import { PagingCollection, SpaceResource } from "@octopusdeploy/message-contracts";
import { Client } from "../client";

const knownSpaces: Record<string, string> = {};

export async function resolveSpaceId(client: Client, spaceName: string): Promise<string> {
    if (knownSpaces[spaceName]) {
        return knownSpaces[spaceName];
    }

    client.debug(`Resolving space from name '${spaceName}'`);

    var spaces = await client.get<PagingCollection<SpaceResource>>("~/api/spaces", { partialName: spaceName });
    var spaceId = "";

    if (spaces.TotalResults === 0) {
        client.error(`No spaces exist with name '${spaceName}'`);
        throw new Error(`No spaces exist with name '${spaceName}'`);
    }

    spaces.Items.forEach(space => {
        if (space.Name == spaceName) {
            spaceId = space.Id;
            knownSpaces[spaceName] = spaceId;
            client.debug(`Resolved space name '${spaceName}' to Id ${spaceId}`);
        }
    });

    if (spaceId === "") {
        client.error(`Unable to resolve space name '${spaceName}'`);
        throw new Error(`Unable to resolve space name '${spaceName}'`);
    }

    return spaceId;
}