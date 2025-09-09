import type { NewSpaceScopedResource, SpaceScopedResource } from "../../../spaceScopedResource";

export interface Release extends SpaceScopedResource {
    ChannelId: string;
    Version: string;
    ReleaseNotes: string;
    IgnoreChannelRules: boolean;
    ProjectDeploymentProcessSnapshotId: string;
    BuildInformation: ReleasePackageVersionBuildInformation[];
    CustomFields: Record<string, string>;
    Assembled: string;
    ProjectId: string;
    ProjectVariableSetSnapshotId: string;
    LibraryVariableSetSnapshotIds: string[];
    SelectedPackages: SelectedPackage[];
    SelectedGitResources: SelectedGitResource[];
    VersionControlReference?: GitReference;
}

export interface NewRelease extends NewSpaceScopedResource {
    Version: string;
    ReleaseNotes?: string;
    ChannelId: string;
    ProjectId: string;
    SelectedPackages?: SelectedPackage[];
    SelectedGitResources?: SelectedGitResource[];
    IgnoreChannelRules?: boolean;
    CustomFields?: Record<string, string>;
}

export interface SelectedPackage {
    ActionName: string;
    PackageReferenceName?: string;
    Version: string;
}

export interface SelectedGitResource {
    ActionName: string;
    GitReferenceResource: GitReference;
    GitResourceReferenceName: string;
}

export interface GitReference {
    GitRef?: string;
    GitCommit?: string;
}

export interface ReleasePackageVersionBuildInformation {
    PackageId: string;
    Version: string;
    BuildEnvironment: string;
    BuildNumber: string;
    BuildUrl: string;
    Branch: string;
    VcsType: string;
    VcsRoot: string;
    VcsCommitId: string;
    VcsCommitUrl: string;
    IssueTrackerName: string;
    WorkItems: WorkItem[];
    Commits: Commit[];
}

export interface WorkItem {
    Id: string;
    LinkUrl: string;
    Description: string;
}

export interface Commit {
    Id: string;
    LinkUrl: string;
    Comment: string;
}