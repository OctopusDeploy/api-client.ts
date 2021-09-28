import type { TenantVariableResource } from "@octopusdeploy/message-contracts";
import type { AllArgs, ListArgs } from "./basicRepository";
import BasicRepository from "./basicRepository";
import type { Client } from "../client";

type TenantVariableListArgs = {
    projectId?: string;
} & ListArgs;

type TenantVariableAllArgs = {
    projectId?: string;
} & AllArgs;

class TenantVariableRepository extends BasicRepository<TenantVariableResource, TenantVariableResource, TenantVariableListArgs, TenantVariableAllArgs> {
    constructor(client: Client) {
        super("TenantVariables", client);
    }
}

export default TenantVariableRepository;
