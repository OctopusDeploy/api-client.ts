import type {
    DocumentTypeResource,
    EventAgentResource,
    EventCategoryResource,
    EventGroupResource,
    EventResource
} from "@octopusdeploy/message-contracts";
import type { ListArgs } from "./basicRepository";
import type { Client } from "../client";
import { MixedScopeBaseRepository } from "./mixedScopeBaseRepository";

interface EventListArgs extends ListArgs {
    from?: string;
    to?: string;
    fromAutoId?: number;
    toAutoId?: number;
    asCsv?: boolean;
    regarding?: string[];
    regardingAny?: string[];
    internal?: boolean;
    users?: string[];
    projects?: string[];
    projectGroups?: string[];
    environments?: string[];
    eventGroups?: string[];
    eventCategories?: string[];
    eventAgents?: string[];
    tenants?: string[];
    tags?: string[];
    documentTypes?: string[];
    excludeDifference?: boolean;
}

export class EventRepository extends MixedScopeBaseRepository<EventResource, EventResource, EventListArgs> {
    constructor(client: Client) {
        super("Events", client);
    }

    categories(options: any): Promise<EventCategoryResource[]> {
        return this.client.get<EventCategoryResource[]>(this.client.getLink("EventCategories"), options);
    }

    groups(options: any): Promise<EventGroupResource[]> {
        return this.client.get<EventGroupResource[]>(this.client.getLink("EventGroups"), options);
    }

    documentTypes(options: any): Promise<DocumentTypeResource[]> {
        return this.client.get<DocumentTypeResource[]>(this.client.getLink("EventDocumentTypes"), options);
    }

    eventAgents(): Promise<EventAgentResource[]> {
        return this.client.get<EventAgentResource[]>(this.client.getLink("EventAgents"));
    }
}