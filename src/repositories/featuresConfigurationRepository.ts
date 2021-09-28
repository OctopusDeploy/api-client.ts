import type { FeaturesConfigurationResource } from "@octopusdeploy/message-contracts";
import type { Client } from "../client";
import { ConfigurationRepository } from "./configurationRepository";

export class FeaturesConfigurationRepository extends ConfigurationRepository<FeaturesConfigurationResource> {
    constructor(client: Client) {
        super("FeaturesConfiguration", client);
    }
}