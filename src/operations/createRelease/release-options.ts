import { PackageIdentity } from "./package-identity";

export interface ReleaseOptions {
    channel?: string | undefined;
    gitRef?: string | undefined;
    gitCommit?: string | undefined;
    ignoreChannelRules: boolean;
    ignoreExisting: boolean;
    packagePrerelease?: string | undefined;
    defaultPackageVersion?: string | undefined;
    packages: PackageIdentity[];
    packagesFolder?: string | undefined;
    releaseNotes?: string | undefined;
    releaseNotesFile?: string | undefined;
    releaseNumber?: string | undefined;
    whatIf: boolean;
}
