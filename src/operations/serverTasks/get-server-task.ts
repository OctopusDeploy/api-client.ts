import { PagingCollection, ResourceCollection, TaskResource } from "@octopusdeploy/message-contracts";
import { Client, resolveSpaceId } from "../..";
import { chunk, flatMap } from "lodash";

export async function getServerTask(client: Client, spaceName: string, serverTaskId: string): Promise<TaskResource> {
    var response = await client.request<TaskResource>(`~/api/{spaceId}/tasks/{serverTaskId}`, { spaceName, serverTaskId });
    return response;
}

interface StatsResourceCollection extends ResourceCollection<TaskResource<any>> {
    TotalCounts: { [state: string]: number };
}

export async function getServerTasks(client: Client, spaceName: string, serverTaskIds: string[]): Promise<TaskResource[]> {
    const batchSize = 300;
    const idArrays = chunk(serverTaskIds, batchSize);
    const promises: Array<Promise<StatsResourceCollection>> = idArrays.map((i, index) => {
        return client.request<StatsResourceCollection>(`~/api/{spaceId}/tasks?ids={serverTaskIds}&skip={skip}&take={take}`, { spaceName, serverTaskIds: i, skip: index * batchSize, take: batchSize });
    });
    return Promise.all(promises).then((result) => flatMap(result, (c) => c.Items));
}

export async function getServerTaskRaw(client: Client, spaceName: string, serverTaskId: string): Promise<string> {
    var response = await client.request<string>(`~/api/{spaceId}/tasks/{serverTaskId}/raw`, { spaceName, serverTaskId });
    return response;
}