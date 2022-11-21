import { OctopusPackageVersionBuildInformationMappedResource, SpaceResource } from "@octopusdeploy/message-contracts";
import { Client } from "../../client";
import { OverwriteMode } from "../../repositories/packageRepository";
import { SpaceScopedOperation } from "../spaceScopedOperation";
import { PackageIdentity } from "./package-identity";

export interface CreateOctopusBuildInformationCommand extends SpaceScopedOperation {
    BuildEnvironment: string;
    BuildNumber: string;
    BuildUrl: string;
    Branch: string;
    VcsType: string;
    VcsRoot: string;
    VcsCommitNumber: string;
    Packages: PackageIdentity[];
    Commits: IOctopusBuildInformationCommit[];
}

export interface IOctopusBuildInformationCommit {
    Id: string;
    Comment: string;
}

export async function pushBuildInformation(
    client: Client,
    buildInformation: CreateOctopusBuildInformationCommand,
    overwriteMode: OverwriteMode = OverwriteMode.FailIfExists
): Promise<void> {
    const tasks: Promise<OctopusPackageVersionBuildInformationMappedResource>[] = [];

    for (const pkg of buildInformation.Packages) {
        tasks.push(
            client.doCreate<OctopusPackageVersionBuildInformationMappedResource>(
                `~/api/{spaceId}/build-information{?overwriteMode}`,
                {
                    spaceName: buildInformation.spaceName,
                    PackageId: pkg.Id,
                    Version: pkg.Version,
                    OctopusBuildInformation: {
                        Branch: buildInformation.Branch,
                        BuildEnvironment: buildInformation.BuildEnvironment,
                        BuildNumber: buildInformation.BuildNumber,
                        BuildUrl: buildInformation.BuildUrl,
                        Commits: buildInformation.Commits.map((c) => ({ Id: c.Id, Comment: c.Comment })),
                        VcsCommitNumber: buildInformation.VcsCommitNumber,
                        VcsRoot: buildInformation.VcsRoot,
                        VcsType: buildInformation.VcsType,
                    },
                },
                { overwriteMode }
            )
        );
    }

    await Promise.all(tasks);
}
