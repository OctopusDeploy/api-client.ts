import type { DefectResource, ResourceCollection, ReleaseResource } from "@octopusdeploy/message-contracts";
import type { Client } from "../client";

class DefectRepository {
    private client: Client;
    constructor(client: Client) {
        this.client = client;
    }
    all(release: ReleaseResource) {
        return this.client.get<ResourceCollection<DefectResource>>(release.Links["Defects"]);
    }
    report(release: ReleaseResource, description: string) {
        return this.client.post(release.Links["ReportDefect"], { Description: description });
    }
    resolve(release: ReleaseResource) {
        return this.client.post(release.Links["ResolveDefect"]);
    }
}

export default DefectRepository;
