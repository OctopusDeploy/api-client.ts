import type { PermissionDescriptions } from "@octopusdeploy/message-contracts";
import type { Client } from "../client";

export class PermissionDescriptionRepository {
    private client: Client;
    constructor(client: Client) {
        this.client = client;
    }

    all(): Promise<PermissionDescriptions> {
        return this.client.get(this.client.getLink("PermissionDescriptions"), null!);
    }
}