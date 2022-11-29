import { Client, ListArgs } from "../..";
import { SpaceScopedBasicRepository } from "../spaceScopedBasicRepository";
import { Lifecycle } from "./lifecycle";

type LifecycleRepositoryListArgs = {
    ids?: string[];
    partialName?: string;
} & ListArgs;

export class LifecycleRepository extends SpaceScopedBasicRepository<Lifecycle, Lifecycle, LifecycleRepositoryListArgs> {
    constructor(client: Client, spaceName: string) {
        super(client, spaceName, "~/api/{spaceId}/lifecycles{/id}{?skip,take,ids,partialName}");
    }
}
