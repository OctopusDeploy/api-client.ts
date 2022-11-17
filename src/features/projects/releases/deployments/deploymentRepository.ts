import type { Client } from "../../../../client";
import { BasicRepositoryV2, ListArgsV2 } from "../../../basicRepositoryV2";
import { TaskState } from "../../../serverTasks";
import { Deployment } from "./deployment";

type DeploymentListArgs = {
    ids?: string[];
    projects?: string[];
    environments?: string[];
    tenants?: string[];
    channels?: string[];
    taskState?: TaskState;
} & ListArgsV2;

export class DeploymentRepository extends BasicRepositoryV2<Deployment, DeploymentListArgs> {
    constructor(client: Client) {
        super(client, "deployments{/id}{?skip,take,ids,projects,environments,tenants,channels,taskState}");
    }
}