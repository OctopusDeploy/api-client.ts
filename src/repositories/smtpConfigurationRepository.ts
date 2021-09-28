import type { Client } from "../client";
import ConfigurationRepository from "./configurationRepository";
import type { SmtpConfigurationResource, SmtpIsConfiguredResource } from "@octopusdeploy/message-contracts";

class SmtpConfigurationRepository extends ConfigurationRepository<SmtpConfigurationResource> {
    constructor(client: Client) {
        super("SmtpConfiguration", client);
    }

    IsConfigured() {
        return this.client.get<SmtpIsConfiguredResource>(this.client.getLink("SmtpIsConfigured"));
    }
}

export default SmtpConfigurationRepository;
