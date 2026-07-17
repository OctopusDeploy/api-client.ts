import { SpaceScopedOperation } from "../../..";

export interface CreateReleaseCommandV1 extends SpaceScopedOperation {
    ProjectName: string;
    PackageVersion?: string;
    GitCommit?: string;
    GitRef?: string;
    ReleaseVersion?: string;
    ChannelName?: string;
    Packages?: string[];
    GitResources?: string[];
    ReleaseNotes?: string;
    IgnoreIfAlreadyExists?: boolean;
    IgnoreChannelRules?: boolean;
    PackagePrerelease?: string;
    CustomFields?: Record<string, string>;
}
