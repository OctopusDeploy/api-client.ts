import type {
    DynamicExtensionsFeaturesMetadataResource,
    DynamicExtensionsFeaturesValuesResource,
    DynamicExtensionsScriptsResource
} from "@octopusdeploy/message-contracts";
import type { Client } from "../client";

export default class DynamicExtensionRepository {
    private client: Client;

    constructor(client: Client) {
        this.client = client;
    }

    getScripts(): Promise<DynamicExtensionsScriptsResource> {
        return this.client.get<DynamicExtensionsScriptsResource>(this.client.getLink("DynamicExtensionsScripts"));
    }

    getFeaturesMetadata(): Promise<DynamicExtensionsFeaturesMetadataResource> {
        return this.client.get<DynamicExtensionsFeaturesMetadataResource>(this.client.getLink("DynamicExtensionsFeaturesMetadata"));
    }

    getFeaturesValues(): Promise<DynamicExtensionsFeaturesValuesResource> {
        return this.client.get<DynamicExtensionsFeaturesValuesResource>(this.client.getLink("DynamicExtensionsFeaturesValues"));
    }

    putFeaturesValues(values: DynamicExtensionsFeaturesValuesResource): Promise<DynamicExtensionsFeaturesValuesResource> {
        return this.client.put<DynamicExtensionsFeaturesValuesResource>(this.client.getLink("DynamicExtensionsFeaturesValues"), values);
    }
}
