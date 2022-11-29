import type { Client } from "../../../../client";
import { SpaceScopedBasicRepository, ListArgs, spaceScopedRoutePrefix } from "../../..";
import { TaskState } from "../../../serverTasks";
import { Deployment, NewDeployment } from "./deployment";

type DeploymentListArgs = {
    ids?: string[];
    projects?: string[];
    environments?: string[];
    tenants?: string[];
    channels?: string[];
    taskState?: TaskState;
} & ListArgs;

export class DeploymentRepository extends SpaceScopedBasicRepository<Deployment, NewDeployment, DeploymentListArgs> {
    constructor(client: Client, spaceName: string) {
        super(client, spaceName, `${spaceScopedRoutePrefix}/deployments{/id}{?skip,take,ids,projects,environments,tenants,channels,taskState}`);
    }
}
