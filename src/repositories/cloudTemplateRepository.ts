import type { DataContext, MetadataTypeCollection } from "@octopusdeploy/message-contracts";
import type { Client } from "../client";

class CloudTemplateRepository {
    private client: Client;
    constructor(client: Client) {
        this.client = client;
    }

    getMetadata(templateBody: string, id: string): Promise<{ Metadata: MetadataTypeCollection; Values: DataContext }> {
        const templateResource: { template: string } = { template: encodeURI(templateBody) };
        return this.client.post<{ Metadata: MetadataTypeCollection; Values: DataContext }>(this.client.getLink("CloudTemplate"), templateResource, { id: id.toString() });
    }
}

export default CloudTemplateRepository;
