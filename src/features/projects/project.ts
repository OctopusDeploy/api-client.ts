/* eslint-disable @typescript-eslint/no-explicit-any */

import type { DeploymentActionPackage } from "./deploymentProcesses";
import type { Lifecycle } from "../lifecycles";
import type { NamedResource } from "../namedResource";
import type { ProjectGroup } from "../projectGroups";
import type { SensitiveValue } from "../variables";
import type { NewSpaceScopedResource, SpaceScopedResource } from "../spaceScopedResource";
import type { TenantedDeploymentMode } from "./tenantedDeploymentMode";
import { Resource } from "../resource";
import { ExtensionSettingsValues } from "../extensionSettingsValues";
import { ActionTemplateParameter } from "./deploymentProcesses/actionTemplateParameter";
import { MetadataTypeCollection } from "../forms/dynamicFormResources";

export enum PersistenceSettingsType {
    VersionControlled = "VersionControlled",
    Database = "Database",
}

interface DatabasePersistenceSettings {
    Type: PersistenceSettingsType.Database;
}

export interface VersionControlledPersistenceSettings {
    Type: PersistenceSettingsType.VersionControlled;
    Credentials: AnonymousVcsCredentials | UsernamePasswordVcsCredentials;
    Url: string;
    DefaultBranch: string;
    BasePath: string;
}

export enum AuthenticationType {
    Anonymous = "Anonymous",
    UsernamePassword = "UsernamePassword",
}

export interface UsernamePasswordVcsCredentials {
    Type: AuthenticationType.UsernamePassword;
    Username: string;
    Password: SensitiveValue;
}

export interface AnonymousVcsCredentials {
    Type: AuthenticationType.Anonymous;
}

export function IsUsingUsernamePasswordAuth(T: AnonymousVcsCredentials | UsernamePasswordVcsCredentials): T is UsernamePasswordVcsCredentials {
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    return (T as UsernamePasswordVcsCredentials).Type === AuthenticationType.UsernamePassword;
}

export function HasVersionControlledPersistenceSettings(
    T: VersionControlledPersistenceSettings | DatabasePersistenceSettings
): T is VersionControlledPersistenceSettings {
    return T.Type === PersistenceSettingsType.VersionControlled;
}

export interface Project extends SpaceScopedResource, NamedResource {
    VariableSetId: string;
    DeploymentProcessId: string;
    DiscreteChannelRelease: boolean;
    IncludedLibraryVariableSetIds: string[];
    TenantedDeploymentMode: TenantedDeploymentMode;
    ReleaseCreationStrategy: ReleaseCreationStrategy;
    Templates: ActionTemplateParameter[];
    AutoDeployReleaseOverrides: any[];
    LifecycleId: string;
    AutoCreateRelease: boolean;
    ClonedFromProjectId: string;
    ExtensionSettings: ExtensionSettingsValues[];
    IsVersionControlled: boolean;
    PersistenceSettings: VersionControlledPersistenceSettings | DatabasePersistenceSettings;
    Slug: string;
    ProjectGroupId: string;
    Description: string;
    IsDisabled: boolean;
}

export type ProjectOrSummary = Project | ProjectSummary;

export interface ProjectSummary extends SpaceScopedResource, NamedResource {
    Slug: string;
    ProjectGroupId: string;
    Description: string;
    IsDisabled: boolean;
}

export interface NewProject extends NewSpaceScopedResource {
    Name: string;
    Slug?: string;
    Description?: string;
    ProjectGroupId: string;
    LifecycleId: string;
}

export function NewProject(name: string, projectGroup: ProjectGroup, lifecycle: Lifecycle): NewProject {
    return {
        LifecycleId: lifecycle.Id,
        Name: name,
        ProjectGroupId: projectGroup.Id,
    };
}

export interface ProjectSettingsMetadata {
    ExtensionId: string;
    Metadata: MetadataTypeCollection;
}

export interface ReleaseCreationStrategy {
    ReleaseCreationPackage: DeploymentActionPackage;
    ChannelId?: string;
    ReleaseCreationPackageStepId?: string;
}

export interface VersionControlCompatibilityResponse {
    Errors: string[];
    Warnings: string[];
    Notices: string[];
}

export interface ConvertProjectToVersionControlledResponse {
    Messages: string[];
}

export interface RecentlyViewedProjectIds {
    [key: string]: string[];
}

export function isVcsBranchResource(branch: unknown): branch is VcsBranch {
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    return (branch as VcsBranch).Name !== undefined;
}

type VcsBranchResourceLinks = {
    DeploymentProcess: string;
    DeploymentSettings: string;
    Runbook: string;
    ReleaseTemplate: string;
    Channels: string;
};

export type GitRef = string;
export type GitCommit = string;

export interface VcsRef {
    GitRef?: GitRef;
    GitCommit?: GitCommit;
}

export interface IVersionControlReference {
    VersionControlReference: VcsRef;
}

export interface VcsBranch extends Resource {
    Name: GitRef;
}

export function getURISafeBranchName(branch: VcsBranch): string {
    return encodeURIComponent(branch.Name);
}

export function getBranchNameFromRouteParameter(routeParameter: string | undefined): string | undefined {
    if (routeParameter) {
        return decodeURIComponent(routeParameter);
    }

    return undefined;
}
