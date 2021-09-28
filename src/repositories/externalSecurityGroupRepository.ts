import type { NamedReferenceItem } from "@octopusdeploy/message-contracts";
import type { Client } from "../client";

class ExternalSecurityGroupRepository {
    private client: Client;
    constructor(client: Client) {
        this.client = client;
    }
    search(url: string, partialName: string): Promise<NamedReferenceItem[]> {
        return this.client.get(url, { partialName });
    }
}

export default ExternalSecurityGroupRepository;
