import type { NewOctopusPackageVersionBuildInformationResource, OctopusPackageVersionBuildInformationMappedResource } from "@octopusdeploy/message-contracts";
import type { Client } from "../client";
import type { AllArgs } from "./basicRepository";
import { BasicRepository, ListArgs } from "./basicRepository";
import { OverwriteMode } from "./packageRepository";

export type BuildInformationListArgs = {
    filter?: string;
    latest?: boolean;
    packageId?: string;
} & ListArgs;

type BuildInformationGetArgs = {};

export type BuildInformationCreateArgs = {
    overwriteMode?: OverwriteMode;
};

export class BuildInformationRepository extends BasicRepository<
    OctopusPackageVersionBuildInformationMappedResource,
    NewOctopusPackageVersionBuildInformationResource,
    BuildInformationListArgs,
    AllArgs,
    BuildInformationGetArgs,
    BuildInformationCreateArgs
> {
    constructor(client: Client) {
        super("BuildInformation", client);
    }

    deleteMany(ids: string[]) {
        return this.client.del(this.client.getLink("BuildInformationBulk"), null, { ids });
    }
}
