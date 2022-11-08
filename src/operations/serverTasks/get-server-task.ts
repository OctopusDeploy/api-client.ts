import { TaskResource } from "@octopusdeploy/message-contracts";
import { Client, resolveSpaceId } from "../..";

export async function getServerTask(client: Client, spaceName: string, serverTaskId: string): Promise<TaskResource> {
    var response = await client.request<TaskResource>(`~/api/{spaceId}/tasks/{serverTaskId}`, { spaceName, serverTaskId });
    return response;
}

export async function getServerTaskRaw(client: Client, spaceName: string, serverTaskId: string): Promise<string> {
    var response = await client.request<string>(`~/api/{spaceId}/tasks/{serverTaskId}/raw`, { spaceName, serverTaskId });
    return response;
}