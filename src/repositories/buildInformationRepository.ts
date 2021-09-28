import type { OctopusPackageVersionBuildInformationMappedResource } from "@octopusdeploy/message-contracts";
import type { AllArgs } from "./basicRepository";
import { BasicRepository, ListArgs } from "./basicRepository";
import type { Client } from "../client";

export type BuildInformationListArgs = {
    filter?: string;
    latest?: boolean;
    packageId?: string;
} & ListArgs;

type BuildInformationGetArgs = {};

export class BuildInformationRepository extends BasicRepository<OctopusPackageVersionBuildInformationMappedResource, OctopusPackageVersionBuildInformationMappedResource, BuildInformationListArgs, AllArgs, BuildInformationGetArgs> {
    constructor(client: Client) {
        super("BuildInformation", client);
    }

    deleteMany(ids: string[]) {
        return this.client.del(this.client.getLink("BuildInformationBulk"), null, { ids });
    }
}