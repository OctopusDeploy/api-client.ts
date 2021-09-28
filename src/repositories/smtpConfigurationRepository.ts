import type { SmtpConfigurationResource, SmtpIsConfiguredResource } from "@octopusdeploy/message-contracts";
import type { Client } from "../client";
import { ConfigurationRepository } from "./configurationRepository";

export class SmtpConfigurationRepository extends ConfigurationRepository<SmtpConfigurationResource> {
    constructor(client: Client) {
        super("SmtpConfiguration", client);
    }

    IsConfigured() {
        return this.client.get<SmtpIsConfiguredResource>(this.client.getLink("SmtpIsConfigured"));
    }
}