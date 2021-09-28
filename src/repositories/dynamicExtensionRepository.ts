import type {
    DynamicExtensionsFeaturesMetadataResource,
    DynamicExtensionsFeaturesValuesResource,
    DynamicExtensionsScriptsResource
} from "@octopusdeploy/message-contracts";
import type { Client } from "../client";

export class DynamicExtensionRepository {
    private client: Client;

    constructor(client: Client) {
        this.client = client;
    }

    getFeaturesMetadata(): Promise<DynamicExtensionsFeaturesMetadataResource> {
        return this.client.get<DynamicExtensionsFeaturesMetadataResource>(this.client.getLink("DynamicExtensionsFeaturesMetadata"));
    }

    getFeaturesValues(): Promise<DynamicExtensionsFeaturesValuesResource> {
        return this.client.get<DynamicExtensionsFeaturesValuesResource>(this.client.getLink("DynamicExtensionsFeaturesValues"));
    }

    getScripts(): Promise<DynamicExtensionsScriptsResource> {
        return this.client.get<DynamicExtensionsScriptsResource>(this.client.getLink("DynamicExtensionsScripts"));
    }

    putFeaturesValues(values: DynamicExtensionsFeaturesValuesResource): Promise<DynamicExtensionsFeaturesValuesResource> {
        return this.client.put<DynamicExtensionsFeaturesValuesResource>(this.client.getLink("DynamicExtensionsFeaturesValues"), values);
    }
}
