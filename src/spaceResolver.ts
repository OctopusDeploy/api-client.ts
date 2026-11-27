import type { Client } from "./client";
import { apiLocation } from "./apiLocation";
import { Space } from "./features/spaces/space";
import { ResourceCollection } from "./resourceCollection";
import { BasicRepository } from "./features";

const knownSpaces: Record<string, string> = {};

// Server-assigned space ids take the form "Spaces-123".
const spaceIdFormat = /^Spaces-\d+$/;

export async function resolveSpaceId(client: Client, spaceNameOrId: string): Promise<string> {
    if (knownSpaces[spaceNameOrId]) {
        return knownSpaces[spaceNameOrId];
    }

    client.debug(`Resolving space from name or id '${spaceNameOrId}'`);

    // We prefer to match on name and only then fall back to id, matching the
    // behaviour of the CLI (https://github.com/OctopusDeploy/cli/issues/30). The
    // server has no single filter covering both, so the name lookup runs first
    // and the id lookup only when the value is shaped like a space id.
    const spaces = await client.get<ResourceCollection<Space>>(
        `${apiLocation}/spaces?partialName=${encodeURIComponent(spaceNameOrId)}&skip=0&take=${BasicRepository.TakeAll}`
    );

    const spaceMatchedByName = spaces.Items.find((space) => space.Name === spaceNameOrId);
    if (spaceMatchedByName) {
        knownSpaces[spaceNameOrId] = spaceMatchedByName.Id;
        client.debug(`Resolved space name '${spaceNameOrId}' to Id ${spaceMatchedByName.Id}`);
        return spaceMatchedByName.Id;
    }

    if (spaceIdFormat.test(spaceNameOrId)) {
        const spaceMatchedById = await tryGetSpaceById(client, spaceNameOrId);
        if (spaceMatchedById) {
            knownSpaces[spaceNameOrId] = spaceMatchedById.Id;
            client.debug(`Resolved space id '${spaceNameOrId}' to space '${spaceMatchedById.Name}'`);
            return spaceMatchedById.Id;
        }
    }

    if (spaces.TotalResults === 0) {
        client.error(`No spaces exist with name or id '${spaceNameOrId}'`);
        throw new Error(`No spaces exist with name or id '${spaceNameOrId}'`);
    }

    client.error(`Unable to resolve space name or id '${spaceNameOrId}'`);
    throw new Error(`Unable to resolve space name or id '${spaceNameOrId}'`);
}

async function tryGetSpaceById(client: Client, spaceId: string): Promise<Space | undefined> {
    try {
        return await client.get<Space>(`${apiLocation}/spaces/${encodeURIComponent(spaceId)}`);
    } catch (error) {
        client.debug(`No space exists with id '${spaceId}'`);
        return undefined;
    }
}
