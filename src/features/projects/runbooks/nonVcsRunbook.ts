import type { ConnectivityPolicy, GuidedFailureMode } from "../deploymentProcesses";
import type { NamedResource } from "../../../namedResource";
import type { RunbookEnvironmentScope } from "./runbookEnvironmentScope";
import type { TenantedDeploymentMode } from "../tenantedDeploymentMode";

export interface RunbookRetentionPeriod {
    QuantityToKeep: number;
    ShouldKeepForever: boolean;
}

export interface NonVcsRunbook extends NamedResource {
    ConnectivityPolicy: ConnectivityPolicy;
    DefaultGuidedFailureMode: GuidedFailureMode;
    Description: string;
    Environments: string[];
    EnvironmentScope: RunbookEnvironmentScope;
    MultiTenancyMode: TenantedDeploymentMode;
    RunbookProcessId: string;
    RunRetentionPolicy: RunbookRetentionPeriod;
    ProjectId: string;
    PublishedRunbookSnapshotId?: string;
    SpaceId: string;
}
