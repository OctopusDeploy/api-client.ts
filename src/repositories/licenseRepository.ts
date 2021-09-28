import type { LicenseResource, LicenseStatusResource } from "@octopusdeploy/message-contracts";
import type { Client } from "../client";

export class LicenseRepository {
    constructor(private readonly client: Client) { }

    getCurrent() {
        return this.client.get<LicenseResource>(this.client.getLink("CurrentLicense"));
    }

    getCurrentStatus() {
        return this.client.get<LicenseStatusResource>(this.client.getLink("CurrentLicenseStatus"));
    }

    modifyCurrent(resource: LicenseResource): Promise<LicenseResource> {
        return this.client.update(resource.Links.Self, resource);
    }
}