import { OctopusSpaceRepository } from "../../repository";

export interface CreateReleaseCommandV1 {
    spaceId: string;
    projectName: string;
    packageVersion: string;
    gitCommit?: string;
    gitRef?: string;
    releaseVersion?: string;
    channelName?: string;
    packages?: string[];
    releaseNotes?: string;
    ignoreIfAlreadyExists: boolean;
    ignoreChannelRules: boolean;
    packagePrerelease?: string;
}

export interface CreateReleaseResponseV1 {
    releaseId: string;
    releaseVersion: string;
}

export async function createRelease(repository: OctopusSpaceRepository, command: CreateReleaseCommandV1): Promise<CreateReleaseResponseV1> {
    console.log(`Creating a release...`);

    var response = await repository.client.do<CreateReleaseResponseV1>("~/api/{spaceId}/releases/create/v1", command);

    console.log(`Release created successfully.`);

    return response;
}
