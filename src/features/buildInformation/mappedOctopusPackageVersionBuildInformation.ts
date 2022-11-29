import { Resource } from "../resource";

export interface CommitDetail {
    Id: string;
    Comment: string;
    LinkUrl: string;
}

export interface WorkItemLink {
    Id: string;
    Description: string;
    LinkUrl: string;
}

export interface MappedOctopusPackageVersionBuildInformation extends Resource {
    Branch: string;
    BuildEnvironment: string;
    BuildNumber: string;
    BuildUrl: string;
    Commits: CommitDetail[];
    Created?: string;
    Id: string;
    IncompleteDataWarning: string;
    IssueTrackerId: string;
    PackageId: string;
    VcsCommitNumber: string;
    VcsCommitUrl: string;
    VcsType: string;
    VcsRoot: string;
    Version: string;
    WorkItems: WorkItemLink[];
}
