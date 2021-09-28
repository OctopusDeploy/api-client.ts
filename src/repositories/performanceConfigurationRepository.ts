import type { PerformanceConfigurationResource } from "@octopusdeploy/message-contracts";
import type { Client } from "../client";
import ConfigurationRepository from "./configurationRepository";

class PerformanceConfigurationRepository extends ConfigurationRepository<PerformanceConfigurationResource> {
    constructor(client: Client) {
        super("PerformanceConfiguration", client);
    }
}

export default PerformanceConfigurationRepository;
