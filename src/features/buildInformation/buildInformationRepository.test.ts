/* eslint-disable @typescript-eslint/init-declarations */
import AdmZip from "adm-zip";
import { randomUUID } from "crypto";
import { mkdtemp, rm } from "fs/promises";
import { tmpdir } from "os";
import path from "path";
import { Client } from "../../client";
import { processConfiguration } from "../../clientConfiguration.test";
import { PackageIdentity } from "./package-identity";
import { BuildInformationRepository } from ".";
import { PackageRepository } from "../packages";
import { Space, SpaceRepository } from "../spaces";
import { userGetCurrent, UserProjection } from "../users";

describe("push build information", () => {
    let client: Client;
    let space: Space;
    let user: UserProjection;

    jest.setTimeout(100000);

    let tempOutDir: string;
    const packages: PackageIdentity[] = [new PackageIdentity("Hello", "1.0.0")];

    beforeAll(async () => {
        tempOutDir = await mkdtemp(path.join(tmpdir(), "octopus_"));

        const zip = new AdmZip();
        zip.addFile("test.txt", Buffer.from("inner content of the file", "utf8"));

        for (const p of packages) {
            const packagePath = path.join(tempOutDir, `${p.Id}.${p.Version}.zip`);
            zip.writeZip(packagePath);
        }

        client = await Client.create(processConfiguration());
        console.log(`Client connected to API endpoint successfully.`);
        user = await userGetCurrent(client);
    });

    beforeEach(async () => {
        const spaceName = randomUUID().substring(0, 20);
        console.log(`Creating space, "${spaceName}"...`);
        const spaceRepository = new SpaceRepository(client);
        space = await spaceRepository.create({ Name: spaceName, SpaceManagersTeams: [], SpaceManagersTeamMembers: [user.Id], IsDefault: false });
    });

    test("to single package", async () => {
        const packageRepository = new PackageRepository(client, space.Name);
        await packageRepository.push([path.join(tempOutDir, "Hello.1.0.0.zip")]);

        await new BuildInformationRepository(client).push({
            spaceName: space.Name,
            BuildEnvironment: "BitBucket",
            Branch: "main",
            BuildNumber: "288",
            BuildUrl: "https://bitbucket.org/octopussamples/petclinic/addon/pipelines/home#!/results/288",
            VcsType: "Git",
            VcsRoot: "http://bitbucket.org/octopussamples/petclinic",
            VcsCommitNumber: "314cf2c3ee916c92a384c2796a6abe332d678e4f",
            Packages: [{ Id: "Hello", Version: "1.0.0" }],
            Commits: [
                {
                    Id: "314cf2c3ee916c92a384c2796a6abe332d678e4f",
                    Comment: "GOD-1 - 'test build info",
                },
            ],
        });

        const results = await packageRepository.list({ filter: "Hello" });
        const result = await packageRepository.get(results.Items[0].Id);

        expect(result.PackageVersionBuildInformation?.VcsCommitNumber).toStrictEqual("314cf2c3ee916c92a384c2796a6abe332d678e4f");
    });

    afterAll(async () => {
        await rm(tempOutDir, { recursive: true });
    });

    afterEach(async () => {
        if (space === undefined || space === null) return;

        console.log(`Deleting space, ${space.Name}...`);
        space.TaskQueueStopped = true;
        const spaceRepository = new SpaceRepository(client);
        await spaceRepository.modify(space);
        await spaceRepository.del(space);
    });
});
