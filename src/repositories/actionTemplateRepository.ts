import type {
    ActionProperties,
    ActionsUpdateProcessResource,
    ActionTemplateCategoryResource,
    ActionTemplateResource,
    ActionTemplateSearchResource,
    ActionTemplateUsageResource,
    ActionUpdateResource,
    CommunityActionTemplateResource
} from "@octopusdeploy/message-contracts";
import BasicRepository from "./basicRepository";
import type { Client } from "../client";

class ActionTemplateRepository extends BasicRepository<ActionTemplateResource, ActionTemplateResource> {
    constructor(client: Client) {
        super("ActionTemplates", client);
    }

    categories(): Promise<ActionTemplateCategoryResource[]> {
        return this.client.get<ActionTemplateCategoryResource[]>(this.client.getLink("ActionTemplatesCategories"));
    }

    getByCommunityTemplate(communityTemplate: CommunityActionTemplateResource) {
        const allArgs = { ...{}, ...{ id: communityTemplate.Id } };
        return this.client.get<ActionTemplateResource>(communityTemplate.Links["InstalledTemplate"], allArgs);
    }

    getUsage(template: Partial<ActionTemplateResource>): Promise<ActionTemplateUsageResource[]> {
        return this.client.get(template.Links!["Usage"]);
    }

    getVersion(actionTemplate: ActionTemplateResource, version: any): Promise<ActionTemplateResource> {
        return this.client.get(actionTemplate.Links["Versions"], { version });
    }

    search(args?: { type?: string }): Promise<ActionTemplateSearchResource[]> {
        return this.client.get<ActionTemplateSearchResource[]>(this.client.getLink("ActionTemplatesSearch"), args);
    }

    updateActions(actionTemplate: Partial<ActionTemplateResource>, actionsToUpdate: ActionsUpdateProcessResource[], defaults: ActionProperties = {}, overrides: ActionProperties = {}) {
        const resource: ActionUpdateResource = {
            ActionsToUpdate: actionsToUpdate,
            Overrides: overrides || {},
            DefaultPropertyValues: defaults || {},
            Version: actionTemplate.Version!,
        };
        return this.client.post(actionTemplate.Links!["ActionsUpdate"], resource);
    }
}

export default ActionTemplateRepository;
