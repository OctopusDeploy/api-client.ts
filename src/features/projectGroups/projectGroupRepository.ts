import { Client, ListArgs, spaceScopedRoutePrefix } from "../..";
import { SpaceScopedBasicRepository } from "../spaceScopedBasicRepository";
import { ProjectGroup } from "./projectGroup";

type ProjectGroupRepositoryListArgs = {
    ids?: string[];
    partialName?: string;
} & ListArgs;

export class ProjectGroupRepository extends SpaceScopedBasicRepository<ProjectGroup, ProjectGroup, ProjectGroupRepositoryListArgs> {
    constructor(client: Client, spaceName: string) {
        super(client, spaceName, `${spaceScopedRoutePrefix}/projectgroups{/id}{?skip,take,ids,partialName}`);
    }
}
