import { WorkItemLink, CommitDetail } from "../../buildInformation";

export interface ReleaseChanges {
    Version: string;
    ReleaseNotes?: string;
    WorkItems: WorkItemLink[];
    Commits: CommitDetail[];
    BuildInformation: ReleasePackageVersionBuildInformation[];
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
