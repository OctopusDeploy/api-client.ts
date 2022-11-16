import { ResourceCollection, TaskResource } from "@octopusdeploy/message-contracts";
import { Client } from "../..";
import { chunk, flatMap } from "lodash";

export async function getServerTask(client: Client, spaceName: string, serverTaskId: string): Promise<TaskResource> {
    var response = await client.request<TaskResource>(`~/api/{spaceId}/tasks/{serverTaskId}`, { spaceName, serverTaskId });
    return response;
}

export async function getServerTasks(client: Client, spaceName: string, serverTaskIds: string[]): Promise<TaskResource[]> {
    const batchSize = 300;
    const idArrays = chunk(serverTaskIds, batchSize);
    const promises: Array<Promise<ResourceCollection<TaskResource<any>>>> = idArrays.map((i, index) => {
        return client.request<ResourceCollection<TaskResource<any>>>(`~/api/{spaceId}/tasks{?skip,take,ids,partialName}`, { spaceName, ids: i, skip: index * batchSize, take: batchSize });
    });
    return Promise.all(promises).then((result) => flatMap(result, (c) => c.Items));
}

export async function getServerTaskRaw(client: Client, spaceName: string, serverTaskId: string): Promise<string> {
    var response = await client.request<string>(`~/api/{spaceId}/tasks/{serverTaskId}/raw`, { spaceName, serverTaskId });
    return response;
}