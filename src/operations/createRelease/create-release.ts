import { Client } from "../../client";

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

export async function createRelease(client: Client, command: CreateReleaseCommandV1): Promise<CreateReleaseResponseV1> {
    console.log(`Creating a release...`);

    // WARNING: server's API currently expects there to be a SpaceIdOrName value, which was intended to allow use of names/slugs, but doesn't
    // work properly due to limitations in the middleware. For now, we'll just set it to the SpaceId
    var response = await client.do<CreateReleaseResponseV1>(`~/api/{spaceId}/releases/create/v1`, {
        spaceIdOrName: command.spaceId,
        ...command,
    });

    console.log(`Release created successfully.`);

    return response;
}
