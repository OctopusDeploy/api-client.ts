import type { ReleaseTemplateResource, VcsBranchResource } from "@octopusdeploy/message-contracts";
import type { Client } from "../client";

export class BranchesRepository {
    constructor(private readonly client: Client) {
        this.client = client;
    }

    getTemplate(branch: VcsBranchResource, channelId: string) {
        return this.client.get<ReleaseTemplateResource>(branch.Links["ReleaseTemplate"], { channel: channelId });
    }
}