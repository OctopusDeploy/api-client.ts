import type { Client } from "../client";
import type { LicenseResource, LicenseStatusResource } from "@octopusdeploy/message-contracts";

class LicenseRepository {
    constructor(private readonly client: Client) { }
    getCurrent() {
        return this.client.get<LicenseResource>(this.client.getLink("CurrentLicense"));
    }
    modifyCurrent(resource: LicenseResource): Promise<LicenseResource> {
        return this.client.update(resource.Links.Self, resource);
    }
    getCurrentStatus() {
        return this.client.get<LicenseStatusResource>(this.client.getLink("CurrentLicenseStatus"));
    }
}

export default LicenseRepository;
