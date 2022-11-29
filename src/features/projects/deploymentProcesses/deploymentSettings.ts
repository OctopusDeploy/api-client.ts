import type { DeploymentActionPackage } from "./deploymentActionPackage";
import type { ICanBeVersionControlled } from "../../canBeVersionControlled";
import type { ICommitCommand } from "../../commitCommand";
import type { Resource } from "../../resource";
import type { SpaceScopedResource } from "../../spaceScopedResource";

export enum GuidedFailureMode {
    EnvironmentDefault = "EnvironmentDefault",
    Off = "Off",
    On = "On",
}

export interface ConnectivityPolicy {
    SkipMachineBehavior: string;
    TargetRoles: string[];
    AllowDeploymentsToNoTargets: boolean;
    ExcludeUnhealthyTargets: boolean;
}

export interface VersioningStrategy {
    Template: string;
    DonorPackage?: DeploymentActionPackage;
    DonorPackageStepId?: string;
}

export interface DeploymentSettingsResource extends Resource, SpaceScopedResource, ICanBeVersionControlled {
    ProjectId: string;
    ConnectivityPolicy: ConnectivityPolicy;
    DefaultGuidedFailureMode: GuidedFailureMode;
    VersioningStrategy: VersioningStrategy;
    ReleaseNotesTemplate?: string;
    DefaultToSkipIfAlreadyInstalled: boolean;
    DeploymentChangesTemplate?: string;
}
export type ModifyDeploymentSettingsCommand = DeploymentSettingsResource & ICommitCommand;

export interface DeploymentSettingsOclResource {
    Ocl: string;
}
export type ModifyDeploymentSettingsOclCommand = DeploymentSettingsOclResource & ICommitCommand;
