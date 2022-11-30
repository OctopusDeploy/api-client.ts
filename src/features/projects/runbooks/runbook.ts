import type { ICommitCommand } from "../../commitCommand";
import type { ConnectivityPolicy, GuidedFailureMode } from "../deploymentProcesses";
import type { NamedResource } from "../../../namedResource";
import type { RunbookRetentionPeriod } from "./runbookRetentionPeriod";
import type { RunbookEnvironmentScope } from "./runbookEnvironmentScope";
import type { TenantedDeploymentMode } from "../tenantedDeploymentMode";
import { SpaceScopedResource } from "../../../spaceScopedResource";

export type ModifyRunbookCommand = Runbook & ICommitCommand;

export interface Runbook extends SpaceScopedResource, NamedResource {
    ProjectId: string;
    Description?: string;
    RunbookProcessId: string;
    PublishedRunbookSnapshotId?: string;
    ConnectivityPolicy: ConnectivityPolicy;
    MultiTenancyMode: TenantedDeploymentMode;
    EnvironmentScope: RunbookEnvironmentScope;
    Environments: string[];
    DefaultGuidedFailureMode: GuidedFailureMode;
    RunRetentionPolicy: RunbookRetentionPeriod;
}

export type NewRunbook = Omit<Runbook, "Id" | "SpaceId" | "RunbookProcessId" | "PublishedRunbookSnapshotId" | "ConnectivityPolicy" | "Environments">;
