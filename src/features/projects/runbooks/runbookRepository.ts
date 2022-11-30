import { Client } from "../../../client";
import { spaceScopedRoutePrefix } from "../../../spaceScopedRoutePrefix";
import { ListArgs } from "../../basicRepository";
import { SpaceScopedBasicRepository } from "../../spaceScopedBasicRepository";
import { Project } from "../project";
import { NewRunbook, Runbook } from "./runbook";

type RunbookListArgs = {
    ids?: string[];
    partialName?: string;
} & ListArgs;

export class RunbookRepository extends SpaceScopedBasicRepository<Runbook, NewRunbook, RunbookListArgs> {
    constructor(client: Client, spaceName: string, project: Project) {
        super(client, spaceName, `${spaceScopedRoutePrefix}/projects/${project.Id}/runbooks{/id}{?skip,take,ids,partialName}`);
    }
}
