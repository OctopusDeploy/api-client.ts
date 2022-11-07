import { OctopusPackageVersionBuildInformationMappedResource, SpaceResource } from "@octopusdeploy/message-contracts";
import { OverwriteMode } from "../../repositories/packageRepository";
import { connect } from "../connect";
import { PackageIdentity } from "./package-identity";

export interface IOctopusBuildInformation {
    buildEnvironment: string;
    buildNumber: string;
    buildUrl: string;
    branch: string;
    vcsType: string;
    vcsRoot: string;
    vcsCommitNumber: string;
    commits: IOctopusBuildInformationCommit[];
}

export interface IOctopusBuildInformationCommit {
    id: string;
    comment: string;
}

export async function pushBuildInformation(
    space: SpaceResource,
    packages: PackageIdentity[],
    buildInformation: IOctopusBuildInformation,
    overwriteMode: OverwriteMode = OverwriteMode.FailIfExists
): Promise<void> {
    const [repository] = await connect(space);
    const tasks: Promise<OctopusPackageVersionBuildInformationMappedResource>[] = [];

    for (const pkg of packages) {
        tasks.push(
            repository.buildInformation.create(
                {
                    PackageId: pkg.id,
                    Version: pkg.version,
                    OctopusBuildInformation: {
                        Branch: buildInformation.branch,
                        BuildEnvironment: buildInformation.buildEnvironment,
                        BuildNumber: buildInformation.buildNumber,
                        BuildUrl: buildInformation.buildUrl,
                        Commits: buildInformation.commits.map((c) => ({ Id: c.id, Comment: c.comment })),
                        VcsCommitNumber: buildInformation.vcsCommitNumber,
                        VcsRoot: buildInformation.vcsRoot,
                        VcsType: buildInformation.vcsType,
                    },
                },
                { overwriteMode }
            )
        );
    }

    await Promise.all(tasks);
}
