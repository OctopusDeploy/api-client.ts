import { OctopusPackageVersionBuildInformationMappedResource, SpaceResource } from "@octopusdeploy/message-contracts";
import { Client } from "../../client";
import { OverwriteMode } from "../../repositories/packageRepository";
import { SpaceScopedOperation } from "../spaceScopedOperation";
import { PackageIdentity } from "./package-identity";

export interface CreateOctopusBuildInformationCommand extends SpaceScopedOperation {
    buildEnvironment: string;
    buildNumber: string;
    buildUrl: string;
    branch: string;
    vcsType: string;
    vcsRoot: string;
    vcsCommitNumber: string;
    packages: PackageIdentity[],
    commits: IOctopusBuildInformationCommit[];
}

export interface IOctopusBuildInformationCommit {
    id: string;
    comment: string;
}

export async function pushBuildInformation(
    client: Client,
    buildInformation: CreateOctopusBuildInformationCommand,
    overwriteMode: OverwriteMode = OverwriteMode.FailIfExists
): Promise<void> {
    const tasks: Promise<OctopusPackageVersionBuildInformationMappedResource>[] = [];

    for (const pkg of buildInformation.packages) {
        tasks.push(
            client.do<OctopusPackageVersionBuildInformationMappedResource>(`~/api/{spaceId}/build-information`,
                {
                    spaceName: buildInformation.spaceName,
                    packageId: pkg.id,
                    version: pkg.version,
                    octopusBuildInformation: {
                        branch: buildInformation.branch,
                        buildEnvironment: buildInformation.buildEnvironment,
                        buildNumber: buildInformation.buildNumber,
                        buildUrl: buildInformation.buildUrl,
                        commits: buildInformation.commits.map((c) => ({ id: c.id, comment: c.comment })),
                        vcsCommitNumber: buildInformation.vcsCommitNumber,
                        vcsRoot: buildInformation.vcsRoot,
                        vcsType: buildInformation.vcsType,
                    },
                },
                { overwriteMode }
            )
        );
    }

    await Promise.all(tasks);
}
