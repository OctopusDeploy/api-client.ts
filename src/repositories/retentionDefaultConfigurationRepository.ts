import type { RetentionDefaultConfigurationResource } from "@octopusdeploy/message-contracts";
import type { Client } from "../client";
import { ConfigurationRepository } from "./configurationRepository";

export class RetentionDefaultConfigurationRepository extends ConfigurationRepository<RetentionDefaultConfigurationResource> {
    constructor(client: Client) {
        super("RetentionDefaultConfiguration", client);
    }
}