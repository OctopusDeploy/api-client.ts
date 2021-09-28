import type { PerformanceConfigurationResource } from "@octopusdeploy/message-contracts";
import type { Client } from "../client";
import { ConfigurationRepository } from "./configurationRepository";

export class PerformanceConfigurationRepository extends ConfigurationRepository<PerformanceConfigurationResource> {
    constructor(client: Client) {
        super("PerformanceConfiguration", client);
    }
}