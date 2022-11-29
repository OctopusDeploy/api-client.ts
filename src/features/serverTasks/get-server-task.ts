import { Client, ResourceCollection } from "../..";
import { chunk, flatMap } from "lodash";
import { ServerTask, ServerTaskDetails } from "../../features/serverTasks";

export async function serverTaskGet(client: Client, spaceName: string, serverTaskId: string): Promise<ServerTask> {
    if (!serverTaskId) {
        throw new Error("Server Task Id was not provided");
    }
    const response = await client.request<ServerTask>(`~/api/{spaceId}/tasks/{serverTaskId}`, { spaceName, serverTaskId });
    return response;
}

export async function serverTasksGet(client: Client, spaceName: string, serverTaskIds: string[]): Promise<ServerTask[]> {
    const batchSize = 300;
    const idArrays = chunk(serverTaskIds, batchSize);
    const promises: Array<Promise<ResourceCollection<ServerTask>>> = idArrays.map((i, index) => {
        return client.request<ResourceCollection<ServerTask>>(`~/api/{spaceId}/tasks{?skip,take,ids,partialName}`, {
            spaceName,
            ids: i,
            skip: index * batchSize,
            take: batchSize,
        });
    });
    return Promise.all(promises).then((result) => flatMap(result, (c) => c.Items));
}

export async function serverTaskDetailsGet(client: Client, spaceName: string, serverTaskId: string): Promise<ServerTaskDetails> {
    if (!serverTaskId) {
        throw new Error("Server Task Id was not provided");
    }
    const response = await client.request<ServerTaskDetails>(`~/api/{spaceId}/tasks/{serverTaskId}/details`, { spaceName, serverTaskId });
    return response;
}

export async function serverTaskRawGet(client: Client, spaceName: string, serverTaskId: string): Promise<string> {
    if (!serverTaskId) {
        throw new Error("Server Task Id was not provided");
    }
    const response = await client.request<string>(`~/api/{spaceId}/tasks/{serverTaskId}/raw`, { spaceName, serverTaskId });
    return response;
}
