import type {
    ServerConfigurationResource,
    ServerConfigurationSettingsSetResource
} from "@octopusdeploy/message-contracts";
import type { Client } from "../client";
import { ConfigurationRepository } from "./configurationRepository";

export class ServerConfigurationRepository extends ConfigurationRepository<ServerConfigurationResource> {
    constructor(client: Client) {
        super("ServerConfiguration", client);
    }
    settings() {
        return this.client.get<ServerConfigurationSettingsSetResource[]>(this.client.getLink("ServerConfigurationSettings"));
    }
}