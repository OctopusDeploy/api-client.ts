import { NewSpace, SpaceResource, UserResource } from "@octopusdeploy/message-contracts";
import AdmZip from "adm-zip";
import { randomUUID } from "crypto";
import { mkdtemp, readFile, rm } from "fs/promises";
import { tmpdir } from "os";
import path from "path";
import { Client } from "../../client";
import { processConfiguration } from "../../clientConfiguration.test";
import { OctopusSpaceRepository, Repository } from "../../repository";
import { PackageIdentity } from "./package-identity";
import { pushBuildInformation } from "./push-build-information";

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
            const packagePath = path.join(tempOutDir, `${p.id}.${p.version}.zip`);
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
        await uploadPackage(path.join(tempOutDir, "Hello.1.0.0.zip"));

        async function uploadPackage(filePath: string) {
            const buffer = await readFile(filePath);
            const fileName = path.basename(filePath);

            console.log(`Uploading ${fileName} package`);
            await repository.packages.upload(new File([buffer], fileName));
        }

        await pushBuildInformation(client, {
            spaceName: space.Name,
            buildEnvironment: "BitBucket",
            branch: "main",
            buildNumber: "288",
            buildUrl: "https://bitbucket.org/octopussamples/petclinic/addon/pipelines/home#!/results/288",
            vcsType: "Git",
            vcsRoot: "http://bitbucket.org/octopussamples/petclinic",
            vcsCommitNumber: "314cf2c3ee916c92a384c2796a6abe332d678e4f",
            packages: [{ id: "Hello", version: "1.0.0" }],
            commits: [
                {
                    id: "314cf2c3ee916c92a384c2796a6abe332d678e4f",
                    comment: "GOD-1 - 'test build info",
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
