import { MappedOctopusPackageVersionBuildInformation } from "../buildInformation/mappedOctopusPackageVersionBuildInformation";
import { Resource } from "../resource";

export interface Package extends Resource {
    Description: string;
    FeedId: string;
    FileExtension: string;
    PackageId: string;
    PackageVersionBuildInformation?: MappedOctopusPackageVersionBuildInformation;
    Published: string;
    ReleaseNotes: string;
    Summary: string;
    Title: string;
    Version: string;
}
