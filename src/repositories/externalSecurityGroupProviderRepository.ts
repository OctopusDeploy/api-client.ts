import type { ExternalSecurityGroupProviderResource } from "@octopusdeploy/message-contracts";
import type { Client } from "../client";

export default class ExternalSecurityGroupProviderRepository {
    private client: Client;
    constructor(client: Client) {
        this.client = client;
    }
    all(): Promise<ExternalSecurityGroupProviderResource[]> {
        return this.client.get(this.client.getLink("ExternalSecurityGroupProviders"));
    }
}
