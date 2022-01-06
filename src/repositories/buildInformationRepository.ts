import type { OctopusPackageVersionBuildInformationMappedResource } from "@octopusdeploy/message-contracts";
import type { AllArgs } from "./basicRepository";
import { BasicRepository, ListArgs } from "./basicRepository";
import type { Client } from "../client";
import {OverwriteMode} from "./packageRepository";
import {CommitDetail} from "@octopusdeploy/message-contracts/dist/commitDetail";

export type BuildInformationListArgs = {
    filter?: string;
    latest?: boolean;
    packageId?: string;
} & ListArgs;

type BuildInformationGetArgs = {};

export type BuildInformationCreateArgs = {
    overwriteMode?: OverwriteMode;
}

export interface NewOctopusPackageVersionBuildInformationResource
{
    PackageId: string,
    Version: string,
    OctopusBuildInformation: OctopusBuildInformationResource,
};

export interface OctopusBuildInformationResource {
    Branch: string;
    BuildEnvironment: string;
    BuildNumber: string;
    BuildUrl: string;
    Commits: Omit<CommitDetail, "LinkUrl">[];
    VcsCommitNumber: string;
    VcsType: string;
    VcsRoot: string;
}

export class BuildInformationRepository extends BasicRepository<OctopusPackageVersionBuildInformationMappedResource, NewOctopusPackageVersionBuildInformationResource, BuildInformationListArgs, AllArgs, BuildInformationGetArgs, BuildInformationCreateArgs> {
    constructor(client: Client) {
        super("BuildInformation", client);
    }

    deleteMany(ids: string[]) {
        return this.client.del(this.client.getLink("BuildInformationBulk"), null, { ids });
    }
}