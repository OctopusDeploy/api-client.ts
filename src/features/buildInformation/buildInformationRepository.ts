import { MappedOctopusPackageVersionBuildInformation } from "./mappedOctopusPackageVersionBuildInformation";
import { Client, SpaceScopedOperation } from "../..";
import { OverwriteMode } from "../overwriteMode";
import { PackageIdentity } from "./package-identity";
import { spaceScopedRoutePrefix } from "../..";

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

export class BuildInformationRepository {
    private readonly client: Client;
    private readonly spaceName: string;

    constructor(client: Client, spaceName: string) {
        this.client = client;
        this.spaceName = spaceName;
    }

    async push(buildInformation: CreateOctopusBuildInformationCommand, overwriteMode: OverwriteMode = OverwriteMode.FailIfExists): Promise<void> {
        const tasks: Promise<MappedOctopusPackageVersionBuildInformation>[] = [];

        for (const pkg of buildInformation.Packages) {
            tasks.push(
                this.client.doCreate<MappedOctopusPackageVersionBuildInformation>(
                    `${spaceScopedRoutePrefix}/build-information{?overwriteMode}`,
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

        await Promise.allSettled(tasks);
    }
}
