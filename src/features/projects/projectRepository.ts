import { Project, NewProject } from "./project";
import { SpaceScopedBasicRepository } from "../spaceScopedBasicRepository";
import { ListArgs } from "../basicRepository";
import { Client } from "../..";

type ProjectListArgs = {
    ids?: string[];
    partialName?: string;
    clonedFromProjectId?: string;
} & ListArgs;

export class ProjectRepository extends SpaceScopedBasicRepository<Project, NewProject, ProjectListArgs> {
    constructor(client: Client, spaceName: string) {
        super(client, spaceName, "~/api/{spaceId}/projects{/id}{?skip,take,ids,partialName,clonedFromProjectId}");
    }
}
