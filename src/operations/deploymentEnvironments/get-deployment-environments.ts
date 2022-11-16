import { ResourceCollection, EnvironmentResource } from "@octopusdeploy/message-contracts";
import { Client } from "../..";
import { chunk, flatMap } from "lodash";

export async function getDeploymentEnvironments(client: Client, spaceName: string, deploymentEnvironmentIds: string[]): Promise<EnvironmentResource[]> {
    const batchSize = 300;
    const idArrays = chunk(deploymentEnvironmentIds, batchSize);
    const promises: Array<Promise<ResourceCollection<EnvironmentResource>>> = idArrays.map((i, index) => {
        return client.request<ResourceCollection<EnvironmentResource>>(`~/api/{spaceId}/environments{?skip,take,ids,partialName}`, { spaceName, ids: i, skip: index * batchSize, take: batchSize });
    });
    return Promise.all(promises).then((result) => flatMap(result, (c) => c.Items));
}