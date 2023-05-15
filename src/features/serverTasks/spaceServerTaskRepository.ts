import { chunk, flatMap } from "lodash";
import { Client } from "../../client";
import { ResourceCollection } from "../../resourceCollection";
import { spaceScopedRoutePrefix } from "../../spaceScopedRoutePrefix";
import { ServerTask } from "./serverTask";
import { ServerTaskDetails } from "./serverTaskDetails";

export class SpaceServerTaskRepository {
    private baseApiPathTemplate = `${spaceScopedRoutePrefix}/tasks`;
    private readonly client: Client;
    private readonly spaceName: string;

    constructor(client: Client, spaceName: string) {
        this.client = client;
        this.spaceName = spaceName;
    }

    async getById<TArgument = void>(serverTaskId: string): Promise<ServerTask> {
        if (!serverTaskId) {
            throw new Error("Server Task Id was not provided");
        }
        const response = await this.client.request<ServerTask<TArgument>>(`${this.baseApiPathTemplate}/${serverTaskId}`, { spaceName: this.spaceName });
        return response;
    }

    async getByIds<TArguments = void>(serverTaskIds: string[]): Promise<ServerTask[]> {
        const batchSize = 300;
        const idArrays = chunk(serverTaskIds, batchSize);
        const promises: Array<Promise<ResourceCollection<ServerTask>>> = [];

        for (const [index, ids] of idArrays.entries()) {
            promises.push(
                this.client.request<ResourceCollection<ServerTask<TArguments>>>(`${this.baseApiPathTemplate}{?skip,take,ids,partialName}`, {
                    spaceName: this.spaceName,
                    ids: ids,
                    skip: index * batchSize,
                    take: batchSize,
                })
            );
        }
        return Promise.allSettled(promises).then((result) => flatMap(result, (c) => (c.status == "fulfilled" ? c.value.Items : [])));
    }

    async getDetails(serverTaskId: string): Promise<ServerTaskDetails> {
        if (!serverTaskId) {
            throw new Error("Server Task Id was not provided");
        }
        const response = await this.client.request<ServerTaskDetails>(`${this.baseApiPathTemplate}/${serverTaskId}/details`, {
            spaceName: this.spaceName,
        });
        return response;
    }

    async getRaw(serverTaskId: string): Promise<string> {
        if (!serverTaskId) {
            throw new Error("Server Task Id was not provided");
        }
        const response = await this.client.request<string>(`${this.baseApiPathTemplate}/${serverTaskId}/raw`, { spaceName: this.spaceName });
        return response;
    }
}
