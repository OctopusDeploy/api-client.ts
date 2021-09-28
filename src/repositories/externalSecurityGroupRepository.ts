import type { NamedReferenceItem } from "@octopusdeploy/message-contracts";
import type { Client } from "../client";

export class ExternalSecurityGroupRepository {
    private client: Client;
    constructor(client: Client) {
        this.client = client;
    }
    search(url: string, partialName: string): Promise<NamedReferenceItem[]> {
        return this.client.get(url, { partialName });
    }
}