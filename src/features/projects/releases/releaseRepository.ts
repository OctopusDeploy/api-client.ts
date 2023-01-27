import type { Client } from "../../../client";
import { checkForCapability, spaceScopedRoutePrefix } from "../../..";
import { CreateReleaseCommandV1 } from "./createReleaseCommandV1";
import { CreateReleaseResponseV1 } from "./createReleaseResponseV1";

export class ReleaseRepository {
    private client: Client;
    private spaceName: string;

    constructor(client: Client, spaceName: string) {
        this.client = client;
        this.spaceName = spaceName;
    }

    async create(command: CreateReleaseCommandV1): Promise<CreateReleaseResponseV1> {
        const capabilityError = await checkForCapability(this.client, "CreateReleaseCommandV1");
        if (capabilityError) {
            this.client.error?.(capabilityError);
            throw new Error(capabilityError);
        }

        this.client.debug(`Creating a release...`);

        // WARNING: server's API currently expects there to be a SpaceIdOrName value, which was intended to allow use of names/slugs, but doesn't
        // work properly due to limitations in the middleware. For now, we'll just set it to the SpaceId
        const response = await this.client.doCreate<CreateReleaseResponseV1>(`${spaceScopedRoutePrefix}/releases/create/v1`, {
            spaceIdOrName: command.spaceName,
            ...command,
        });

        this.client.debug(`Release created successfully.`);

        return response;
    }
}
