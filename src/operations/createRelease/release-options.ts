import { ChannelResource } from "@octopusdeploy/message-contracts";
import { PackageIdentity } from "./package-identity";

export interface ReleaseOptions {
    channel?: ChannelResource;
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
