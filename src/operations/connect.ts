import {ClientConfiguration} from "../clientConfiguration";
import {Client} from "../client";
import {OctopusSpaceRepository, Repository} from "../repository";

export async function connect(configuration: ClientConfiguration, space: string): Promise<[repository: OctopusSpaceRepository, client: Client]> {
    const client = await Client.create(configuration);
    if (client === undefined) {
        throw new Error("client could not be constructed");
    }

    if (!client.isConnected() && !configuration.autoConnect) {
        await client.connect((message, error) => error ? client.error("Could not connect", error) : client.info(message));
    }

    const repository = await new Repository(client).forSpace(space);
    return [repository, client];
}