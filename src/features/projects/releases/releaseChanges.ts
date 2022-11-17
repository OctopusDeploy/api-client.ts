export interface ReleaseChanges {
    version: string;
    releaseNotes: string;
    workItems: WorkItemLink[];
    commits: CommitDetail[];
    buildInformation: ReleasePackageVersionBuildInformation[];
}

export interface WorkItemLink {
    id: string;
    description: string;
    linkUrl: string;
}

export interface CommitDetail {
    id: string;
    comment: string;
    linkUrl: string;
}

export interface ReleasePackageVersionBuildInformation {
    packageId: string;
    version: string;
    buildNumber: string;
    buildUrl: string;
    vcsType: string;
    vcsRoot: string;
    vcsCommitNumber: string;
  }
