import type { ActionTemplateResource, CommunityActionTemplateResource } from "@octopusdeploy/message-contracts";
import type { Client } from "../client";

export class CommunityActionTemplateRepository {
    private client: Client;
    constructor(client: Client) {
        this.client = client;
    }

    get(id: string) {
        const allArgs = { ...{}, ...{ id } };
        return this.client.get<CommunityActionTemplateResource>(this.client.getLink("CommunityActionTemplates"), allArgs);
    }

    install(communityActionTemplate: CommunityActionTemplateResource) {
        return this.client.post<ActionTemplateResource>(communityActionTemplate.Links["Installation"]);
    }

    updateInstallation(communityActionTemplate: CommunityActionTemplateResource) {
        return this.client.put<ActionTemplateResource>(communityActionTemplate.Links["Installation"]);
    }
}