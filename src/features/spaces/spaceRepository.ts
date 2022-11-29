import { apiLocation, Client } from "../..";
import { BasicRepository, ListArgs } from "../basicRepository";
import { NewSpace, Space } from "./space";

type SpaceRepositoryListArgs = {
    ids?: string[];
    partialName?: string;
} & ListArgs;

export class SpaceRepository extends BasicRepository<Space, NewSpace, SpaceRepositoryListArgs> {
    constructor(client: Client) {
        super(client, `${apiLocation}/spaces{/id}{?skip,ids,take,partialName}`);
    }
}
