import type { DashboardConfigurationResource } from "@octopusdeploy/message-contracts";
import type { Client } from "../client";
import ConfigurationRepository from "./configurationRepository";

class DashboardConfigurationRepository extends ConfigurationRepository<DashboardConfigurationResource> {
    constructor(client: Client) {
        super("DashboardConfiguration", client);
    }
}

export default DashboardConfigurationRepository;
