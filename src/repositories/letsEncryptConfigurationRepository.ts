import type { LetsEncryptConfigurationResource } from "@octopusdeploy/message-contracts";
import type { Client } from "../client";
import { ConfigurationRepository } from "./configurationRepository";

export class LetsEncryptConfigurationRepository extends ConfigurationRepository<LetsEncryptConfigurationResource> {
    constructor(client: Client) {
        super("LetsEncryptConfiguration", client);
    }
}