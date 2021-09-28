import type { UpgradeConfigurationResource } from "@octopusdeploy/message-contracts";
import type { Client } from "../client";
import { ConfigurationRepository } from "./configurationRepository";

export class UpgradeConfigurationRepository extends ConfigurationRepository<UpgradeConfigurationResource> {
    constructor(client: Client) {
        super("UpgradeConfiguration", client);
    }
}