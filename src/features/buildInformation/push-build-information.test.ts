/* eslint-disable @typescript-eslint/init-declarations */
import { NewSpace, SpaceResource, UserResource } from "@octopusdeploy/message-contracts";
import AdmZip from "adm-zip";
import { randomUUID } from "crypto";
import { mkdtemp, rm } from "fs/promises";
import { tmpdir } from "os";
import path from "path";
import { Client } from "../../client";
import { processConfiguration } from "../../clientConfiguration.test";
import { OctopusSpaceRepository, Repository } from "../../repository";
import { PackageIdentity } from "./package-identity";
import { buildInformationPush } from ".";
import { packagePush } from "../packages";

describe("push build information", () => {
    let client: Client;
    let space: SpaceResource;
    let systemRepository: Repository;
    let repository: OctopusSpaceRepository;
    let user: UserResource;

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
        systemRepository = new Repository(client);
        user = await systemRepository.users.getCurrent();
    });

    beforeEach(async () => {
        const spaceName = randomUUID().substring(0, 20);
        console.log(`Creating space, "${spaceName}"...`);
        space = await systemRepository.spaces.create(NewSpace(spaceName, [], [user]));
        repository = await systemRepository.forSpace(space);
    });

    test("to single package", async () => {
        await packagePush(client, space.Name, [path.join(tempOutDir, "Hello.1.0.0.zip")]);

        await buildInformationPush(client, {
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

        const results = await repository.packages.list({ filter: "Hello" });

        const result = await repository.packages.get(results.Items[0].Id);

        expect(result.PackageVersionBuildInformation?.VcsCommitNumber).toStrictEqual("314cf2c3ee916c92a384c2796a6abe332d678e4f");
    });

    afterAll(async () => {
        await rm(tempOutDir, { recursive: true });
    });

    afterEach(async () => {
        if (space === undefined || space === null) return;

        console.log(`Deleting space, ${space.Name}...`);
        space.TaskQueueStopped = true;
        await systemRepository.spaces.modify(space);
        await systemRepository.spaces.del(space);
    });
});
