import type { Client } from "../client";
import ConfigurationRepository from "./configurationRepository";
import type { MaintenanceConfigurationResource } from "@octopusdeploy/message-contracts";

class MaintenanceConfigurationRepository extends ConfigurationRepository<MaintenanceConfigurationResource> {
    constructor(client: Client) {
        super("MaintenanceConfiguration", client);
    }
}

export default MaintenanceConfigurationRepository;
