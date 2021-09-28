/* eslint-disable @typescript-eslint/no-explicit-any */

import type { Client } from "../client";
import { BasicRepository } from "./basicRepository";
import type { MetadataTypeCollection, SettingsMetadataItemResource } from "@octopusdeploy/message-contracts";

class SettingsRepository extends BasicRepository<SettingsMetadataItemResource, SettingsMetadataItemResource> {
    constructor(client: Client) {
        super("Configuration", client);
    }

    getById(id: string): Promise<SettingsMetadataItemResource> {
        return this.client.get<SettingsMetadataItemResource>(this.client.getLink("Configuration"), { id });
    }

    getValues(resource: SettingsMetadataItemResource): Promise<any> {
        return this.client.get<any>(resource.Links["Values"]);
    }

    getMetadata(resource: SettingsMetadataItemResource): Promise<MetadataTypeCollection> {
        return this.client.get<MetadataTypeCollection>(resource.Links["Metadata"]);
    }

    saveValues(metadataResource: SettingsMetadataItemResource, resource: any) {
        return this.client.put(metadataResource.Links["Values"], resource);
    }
}

export default SettingsRepository;
