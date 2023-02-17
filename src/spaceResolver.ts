import type { Client } from "./client";
import { apiLocation } from "./apiLocation";
import { Space } from "./features/spaces/space";
import { ResourceCollection } from "./resourceCollection";

const knownSpaces: Record<string, string> = {};

export async function resolveSpaceId(client: Client, spaceName: string): Promise<string> {
    if (knownSpaces[spaceName]) {
        return knownSpaces[spaceName];
    }

    client.debug(`Resolving space from name '${spaceName}'`);

    const spaces = await client.get<ResourceCollection<Space>>(`${apiLocation}/spaces?partialName=${spaceName}&skip=0&take=2147483647`); // 2^31-1 same as Int32.MaxValue
    let spaceId = "";

    if (spaces.TotalResults === 0) {
        client.error(`No spaces exist with name '${spaceName}'`);
        throw new Error(`No spaces exist with name '${spaceName}'`);
    }

    spaces.Items.forEach((space) => {
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
