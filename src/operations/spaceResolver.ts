import { SpaceSearchResult } from "@octopusdeploy/message-contracts";
import { Client } from "../client";

const knownSpaces: Record<string, string> = {};

export async function resolveSpaceId(client: Client, spaceName: string): Promise<string> {
    if (knownSpaces[spaceName]) {
        return knownSpaces[spaceName];
    }

    console.log(`Resolving space from name '${spaceName}'`);

    var spaces = await client.get<SpaceSearchResult[]>(client.getLink("SpaceSearch"), { keyword: spaceName });
    var spaceId = "";

    spaces.forEach(space => {
        if (space.Name == spaceName) {
            spaceId = space.Id;
            knownSpaces[spaceName] = spaceId;
            console.log(`Resolved space name '${spaceName}' to Id ${spaceId}`);
        }
    });

    return spaceId;
}