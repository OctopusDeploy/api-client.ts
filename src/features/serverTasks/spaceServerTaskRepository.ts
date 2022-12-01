import { chunk, flatMap } from "lodash";
import { Client } from "../../client";
import { ResourceCollection } from "../../resourceCollection";
import { spaceScopedRoutePrefix } from "../../spaceScopedRoutePrefix";
import { ServerTask } from "./serverTask";
import { ServerTaskDetails } from "./serverTaskDetails";

export class SpaceServerTaskRepository {
    private baseApiTemplate = `${spaceScopedRoutePrefix}/tasks{/id}{?skip,take,ids}`;
    private readonly client: Client;
    private readonly spaceName: string;

    constructor(client: Client, spaceName: string) {
        this.client = client;
        this.spaceName = spaceName;
    }

    async getById(serverTaskId: string): Promise<ServerTask> {
        if (!serverTaskId) {
            throw new Error("Server Task Id was not provided");
        }
        const response = await this.client.request<ServerTask>(`${spaceScopedRoutePrefix}/tasks/{serverTaskId}`, { spaceName: this.spaceName, serverTaskId });
        return response;
    }

    async getByIds(serverTaskIds: string[]): Promise<ServerTask[]> {
        const batchSize = 300;
        const idArrays = chunk(serverTaskIds, batchSize);
        const promises: Array<Promise<ResourceCollection<ServerTask>>> = idArrays.map((i, index) => {
            return this.client.request<ResourceCollection<ServerTask>>(`${spaceScopedRoutePrefix}/tasks{?skip,take,ids,partialName}`, {
                spaceName: this.spaceName,
                ids: i,
                skip: index * batchSize,
                take: batchSize,
            });
        });
        return Promise.all(promises).then((result) => flatMap(result, (c) => c.Items));
    }

    async getDetails(serverTaskId: string): Promise<ServerTaskDetails> {
        if (!serverTaskId) {
            throw new Error("Server Task Id was not provided");
        }
        const response = await this.client.request<ServerTaskDetails>(`${spaceScopedRoutePrefix}/tasks/{serverTaskId}/details`, {
            spaceName: this.spaceName,
            serverTaskId,
        });
        return response;
    }

    async getRaw(serverTaskId: string): Promise<string> {
        if (!serverTaskId) {
            throw new Error("Server Task Id was not provided");
        }
        const response = await this.client.request<string>(`${spaceScopedRoutePrefix}/tasks/{serverTaskId}/raw`, { spaceName: this.spaceName, serverTaskId });
        return response;
    }
}
