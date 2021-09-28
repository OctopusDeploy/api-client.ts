import type { MaintenanceConfigurationResource } from "@octopusdeploy/message-contracts";
import type { Client } from "../client";
import { ConfigurationRepository } from "./configurationRepository";

export class MaintenanceConfigurationRepository extends ConfigurationRepository<MaintenanceConfigurationResource> {
    constructor(client: Client) {
        super("MaintenanceConfiguration", client);
    }
}