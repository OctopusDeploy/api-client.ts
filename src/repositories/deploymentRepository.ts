import type { DeploymentResource, NewDeploymentResource, TaskState } from "@octopusdeploy/message-contracts";
import type { ListArgs } from "./basicRepository";
import { BasicRepository } from "./basicRepository";
import type { Client } from "../client";

type DeploymentListArgs = {
    projects?: string[];
    environments?: string[];
    tenants?: string[];
    channels?: string[];
    taskState?: TaskState;
} & ListArgs;

export class DeploymentRepository extends BasicRepository<DeploymentResource, NewDeploymentResource, DeploymentListArgs> {
    constructor(client: Client) {
        super("Deployments", client);
    }
}