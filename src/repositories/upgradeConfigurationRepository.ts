import type { UpgradeConfigurationResource } from "@octopusdeploy/message-contracts";
import type { Client } from "../client";
import ConfigurationRepository from "./configurationRepository";

class UpgradeConfigurationRepository extends ConfigurationRepository<UpgradeConfigurationResource> {
    constructor(client: Client) {
        super("UpgradeConfiguration", client);
    }
}

export default UpgradeConfigurationRepository;
