import type { Client } from "../client";
import ConfigurationRepository from "./configurationRepository";
import type { ServerConfigurationResource, ServerConfigurationSettingsSetResource } from "@octopusdeploy/message-contracts";

class ServerConfigurationRepository extends ConfigurationRepository<ServerConfigurationResource> {
    constructor(client: Client) {
        super("ServerConfiguration", client);
    }
    settings() {
        return this.client.get<ServerConfigurationSettingsSetResource[]>(this.client.getLink("ServerConfigurationSettings"));
    }
}

export default ServerConfigurationRepository;
