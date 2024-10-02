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

        const rejectedTasks: unknown[] = [];

        const completedTasks = await Promise.allSettled(tasks);
        for (const t of completedTasks) {
            if (t.status === "rejected") {
                rejectedTasks.push(t.reason);
            }
        }

        const errors: Error[] = [];
        for (const e of rejectedTasks) {
            if (e instanceof Error) {
                errors.push(e);
            } else {
                errors.push(new Error(`unexpected error: ${e}`));
            }
        }

        if (errors.length > 0) {
            const error = errors.map((e) => `${e}`);
            throw new Error(error.join("\n"));
        }
    }
}
