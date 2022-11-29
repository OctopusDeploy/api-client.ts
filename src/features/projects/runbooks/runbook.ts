import type { ICommitCommand } from "../../commitCommand";
import type { ConnectivityPolicy, GuidedFailureMode } from "../deploymentProcesses";
import type { NamedResource } from "../../namedResource";
import type { NonVcsRunbook } from "./nonVcsRunbook";
import type { RunbookEnvironmentScope } from "./runbookEnvironmentScope";
import type { TenantedDeploymentMode } from "../tenantedDeploymentMode";

export type Runbook = NonVcsRunbook | VcsRunbook;
export type ModifyRunbookCommand = Runbook & ICommitCommand;

// We have to use this type assertion instead of "IsVcsRunbook", because a VcsRunbook is structurally a NonVcsRunbookResource
// I.e. they share all the same properties. This causes typescript to fail to narrow the type.
// However, if you do it this way, then it works :shrug:
export function IsNonVcsRunbook(runbook: NonVcsRunbook | VcsRunbook): runbook is NonVcsRunbook {
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    return (runbook as NonVcsRunbook).ProjectId !== undefined;
}

export interface VcsRunbook extends NamedResource {
    ConnectivityPolicy: ConnectivityPolicy;
    DefaultGuidedFailureMode: GuidedFailureMode;
    Description: string;
    Environments: string[];
    EnvironmentScope: RunbookEnvironmentScope;
    MultiTenancyMode: TenantedDeploymentMode;
}

export type NewVcsRunbook = Omit<VcsRunbook, "Id" | "ConnectivityPolicy" | "Environments">;

export type NewNonVcsRunbook = Omit<
    NonVcsRunbook,
    "Id" | "SpaceId" | "RunbookProcessId" | "PublishedRunbookSnapshotId" | "ConnectivityPolicy" | "Environments"
>;
