export interface ReleaseOptions {
    channel?: string | undefined;
    defaultPackageVersion: boolean;
    gitRef?: string | undefined;
    gitCommit?: string | undefined;
    ignoreChannelRules: boolean;
    ignoreExisting: boolean;
    package?: string | undefined;
    packagePrerelease?: string | undefined;
    packages: string[];
    packageVersion?: string | undefined;
    packagesFolder?: string | undefined;
    releaseNotes?: string | undefined;
    releaseNotesFile?: string | undefined;
    releaseNumber?: string | undefined;
    whatIf: boolean;
}