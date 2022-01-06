import { ClientConfiguration } from "../../clientConfiguration";
import { OverwriteMode } from "../../repositories/packageRepository";
import { PackageIdentity } from "../createRelease/package-identity";
import { connect } from "../connect";
import { OctopusPackageVersionBuildInformationMappedResource } from "@octopusdeploy/message-contracts";

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
    configuration: ClientConfiguration,
    space: string,
    packages: PackageIdentity[],
    buildInformation: IOctopusBuildInformation,
    overwriteMode: OverwriteMode = OverwriteMode.FailIfExists
): Promise<void> {
    const [repository] = await connect(configuration, space);
    const tasks: Promise<OctopusPackageVersionBuildInformationMappedResource>[] = [];

    for (let pkg of packages) {
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
