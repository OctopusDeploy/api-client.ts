import type { Client } from "../../../../client";
import { SpaceScopedBasicRepositoryV2, ListArgsV2 } from "../../..";
import { TaskState } from "../../../serverTasks";
import { Deployment, NewDeployment } from "./deployment";

type DeploymentListArgs = {
    ids?: string[];
    projects?: string[];
    environments?: string[];
    tenants?: string[];
    channels?: string[];
    taskState?: TaskState;
} & ListArgsV2;

export class DeploymentRepository extends SpaceScopedBasicRepositoryV2<Deployment, NewDeployment, DeploymentListArgs> {
    constructor(client: Client, spaceName: string) {
        super(client, spaceName, "~/api/{spaceId}/deployments{/id}{?skip,take,ids,projects,environments,tenants,channels,taskState}");
    }
}