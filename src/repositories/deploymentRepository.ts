import type { DeploymentResource, NewDeploymentResource, TaskState } from "@octopusdeploy/message-contracts";
import { BasicRepositoryV2, ListArgsV2 } from "./basicRepositoryV2";
import type { Client } from "../client";

type DeploymentListArgs = {
    projects?: string[];
    environments?: string[];
    tenants?: string[];
    channels?: string[];
    taskState?: TaskState;
} & ListArgsV2;

export class DeploymentRepository extends BasicRepositoryV2<DeploymentResource, NewDeploymentResource, DeploymentListArgs> {
    constructor(client: Client) {
        super(client, "deployments{/id}{?skip,take,ids,projects,environments,tenants,channels,taskState,partialName}");
    }
}