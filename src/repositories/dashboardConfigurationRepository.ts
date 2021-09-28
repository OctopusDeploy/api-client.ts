import type { DashboardConfigurationResource } from "@octopusdeploy/message-contracts";
import type { Client } from "../client";
import { ConfigurationRepository } from "./configurationRepository";

export class DashboardConfigurationRepository extends ConfigurationRepository<DashboardConfigurationResource> {
    constructor(client: Client) {
        super("DashboardConfiguration", client);
    }
}