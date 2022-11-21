export interface ReleaseChanges {
    Version: string;
    ReleaseNotes: string;
    WorkItems: WorkItemLink[];
    Commits: CommitDetail[];
    BuildInformation: ReleasePackageVersionBuildInformation[];
}

export interface WorkItemLink {
    Id: string;
    Description: string;
    LinkUrl: string;
}

export interface CommitDetail {
    Id: string;
    Comment: string;
    LinkUrl: string;
}

export interface ReleasePackageVersionBuildInformation {
    PackageId: string;
    Version: string;
    BuildNumber: string;
    BuildUrl: string;
    VcsType: string;
    VcsRoot: string;
    VcsCommitNumber: string;
}
