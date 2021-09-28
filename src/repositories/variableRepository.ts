/* eslint-disable @typescript-eslint/no-explicit-any */

import type { VariableSetResource } from "@octopusdeploy/message-contracts";
import BasicRepository from "./basicRepository";
import type { Client } from "../client";

class VariableRepository extends BasicRepository<VariableSetResource, VariableSetResource> {
    constructor(client: Client) {
        super("Variables", client);
    }

    // FIXME: cac-runbooks, need to be able to load variables for VCS runbooks too
    getNamesForDeploymentProcess(projectId: string, projectEnvironmentsFilter?: any): Promise<string[]> {
        return this.client.get(this.client.getLink("VariableNames"), {
            project: projectId,
            projectEnvironmentsFilter: projectEnvironmentsFilter ? projectEnvironmentsFilter.join(",") : projectEnvironmentsFilter,
        });
    }

    getNamesForRunbookProcess(projectId: string, runbookId: string, projectEnvironmentsFilter?: any): Promise<string[]> {
        return this.client.get(this.client.getLink("VariableNames"), {
            project: projectId,
            runbook: runbookId,
            projectEnvironmentsFilter: projectEnvironmentsFilter ? projectEnvironmentsFilter.join(",") : projectEnvironmentsFilter,
        });
    }

    getSpecialVariableNames(): Promise<string[]> {
        return this.client.get(this.client.getLink("VariableNames"), {});
    }

    // FIXME: cac-runbooks, need to be able to load variables for VCS runbooks too
    preview(projectId: string, runbookId: string | undefined, actionId: string, environmentId: string, machineId: string, channelId: string, tenantId: string): Promise<VariableSetResource> {
        return this.client.get(this.client.getLink("VariablePreview"), {
            project: projectId,
            runbook: runbookId,
            environment: environmentId,
            channel: channelId,
            tenant: tenantId,
            action: actionId,
            machine: machineId,
        });
    }
}

export default VariableRepository;
