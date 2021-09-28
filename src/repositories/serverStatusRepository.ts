import type {
    ActivityLogElement,
    ExtensionsInfoResource,
    ServerDocumentCounts,
    ServerStatusHealthResource,
    ServerStatusResource,
    ServerTimezoneResource,
    SystemInfoResource
} from "@octopusdeploy/message-contracts"
import type { Client } from "../client";
import type { ListArgs } from "./basicRepository";

type LogsListArgs = {
    includeDetail: boolean;
} & ListArgs;

export class ServerStatusRepository {
    private client: Client;
    constructor(client: Client) {
        this.client = client;
    }
    getServerStatus() {
        return this.client.get<ServerStatusResource>(this.client.getLink("ServerStatus"));
    }
    getLogs(status: ServerStatusResource, args?: LogsListArgs) {
        return this.client.get<ActivityLogElement[]>(status.Links["RecentLogs"], args);
    }

    getHealth(status: ServerStatusResource) {
        return this.client.get<ServerStatusHealthResource>(status.Links["Health"]);
    }

    getSystemInfo(status: ServerStatusResource) {
        return this.client.get<SystemInfoResource>(status.Links["SystemInfo"]);
    }
    gcCollect(status: ServerStatusResource) {
        return this.client.post(status.Links["GCCollect"], status);
    }
    getDocumentCounts(status: ServerStatusResource) {
        return this.client.get<ServerDocumentCounts>(status.Links["DocumentCounts"]);
    }

    getExtensionStats() {
        return this.client.get<ExtensionsInfoResource[]>(this.client.getLink("ExtensionStats"));
    }
    getTimezones() {
        return this.client.get<ServerTimezoneResource[]>(this.client.getLink("Timezones"));
    }
}