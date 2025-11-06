import { Client, DeploymentEnvironmentV2, ListArgs, ResourceCollection, spaceScopedRoutePrefix } from "../..";

type EnvironmentV2RepositoryListArgs = {
    ids?: string[];
    partialName?: string;
    skip: number;
    take: number;
} & ListArgs;

export class EnvironmentV2Repository {
    private client: Client;
    private spaceName: string;

    constructor(client: Client, spaceName: string) {
        this.client = client;
        this.spaceName = spaceName;
    }

    async list(args?: EnvironmentV2RepositoryListArgs): Promise<ResourceCollection<DeploymentEnvironmentV2>> {
        return this.client.request(`${spaceScopedRoutePrefix}/environments/v2{?skip,take}`, {
            spaceName: this.spaceName,
            ...args, // not sure what args is doing but lets leave it for now
        });
    }
}
