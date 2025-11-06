import { Client, DeploymentEnvironmentV2, ResourceCollection, spaceScopedRoutePrefix } from "../..";

type EnvironmentV2RepositoryListArgs = {
    ids?: string[];
    partialName?: string;
    type?: EnvironmentType;
    skip: number;
    take: number;
};

type EnvironmentType = "Static" | "Parent" | "Ephemeral";

export class EnvironmentV2Repository {
    private client: Client;
    private spaceName: string;

    constructor(client: Client, spaceName: string) {
        this.client = client;
        this.spaceName = spaceName;
    }

    async list(args?: EnvironmentV2RepositoryListArgs): Promise<ResourceCollection<DeploymentEnvironmentV2>> {
        return this.client.request(`${spaceScopedRoutePrefix}/environments/v2{?ids,partialName,type,skip,take}`, {
            spaceName: this.spaceName,
            ...args,
        });
    }
}
