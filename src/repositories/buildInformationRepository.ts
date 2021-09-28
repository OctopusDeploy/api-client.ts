import type { OctopusPackageVersionBuildInformationMappedResource } from "@octopusdeploy/message-contracts";
import type { AllArgs } from "./basicRepository";
import BasicRepository from "./basicRepository";
import type { Client } from "../client";

type BuildInformationListArgs = {
    filter?: string;
    latest?: boolean;
    packageId?: string;
    skip?: number;
    take?: number;
};

type BuildInformationGetArgs = {};

class BuildInformationRepository extends BasicRepository<OctopusPackageVersionBuildInformationMappedResource, OctopusPackageVersionBuildInformationMappedResource, BuildInformationListArgs, AllArgs, BuildInformationGetArgs> {
    constructor(client: Client) {
        super("BuildInformation", client);
    }

    deleteMany(ids: string[]) {
        return this.client.del(this.client.getLink("BuildInformationBulk"), null, { ids });
    }
}

export default BuildInformationRepository;
