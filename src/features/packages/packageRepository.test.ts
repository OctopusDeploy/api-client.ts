/* eslint-disable @typescript-eslint/init-declarations */
import AdmZip from "adm-zip";
import { randomUUID } from "crypto";
import { mkdtemp, rm } from "fs/promises";
import { tmpdir } from "os";
import path from "path";
import { Client } from "../../client";
import { processConfiguration } from "../../clientConfiguration.test";
import { OverwriteMode } from "../overwriteMode";
import { PackageRepository } from ".";
import { Space, SpaceRepository } from "../spaces";
import { userGetCurrent, UserProjection } from "../users";

describe("push package", () => {
    let client: Client;
    let space: Space;
    let user: UserProjection;

    jest.setTimeout(100000);

    let tempOutDir: string;
    const packages: string[] = ["Hello:1.0.0", "GoodBye:2.0.0"];

    beforeAll(async () => {
        tempOutDir = await mkdtemp(path.join(tmpdir(), "octopus_"));

        const zip = new AdmZip();
        zip.addFile("test.txt", Buffer.from("inner content of the file", "utf8"));

        for (const p of packages) {
            const packagePath = path.join(tempOutDir, `${p.replace(":", ".")}.zip`);
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

    test("single package", async () => {
        const packageRepository = new PackageRepository(client, space.Name);
        await packageRepository.push([path.join(tempOutDir, `Hello.1.0.0.zip`)], OverwriteMode.OverwriteExisting);

        const results = await packageRepository.list({ filter: "Hello" });
        const result = await packageRepository.get(results.Items[0].Id);

        expect(result.PackageId).toStrictEqual("Hello");
        expect(result.Version).toStrictEqual("1.0.0");
    });

    test("multiple packages", async () => {
        const packageRepository = new PackageRepository(client, space.Name);
        await packageRepository.push([path.join(tempOutDir, `Hello.1.0.0.zip`), path.join(tempOutDir, `GoodBye.2.0.0.zip`)], OverwriteMode.OverwriteExisting);

        let results = await packageRepository.list({ filter: "Hello" });
        let result = await packageRepository.get(results.Items[0].Id);

        expect(result.PackageId).toStrictEqual("Hello");
        expect(result.Version).toStrictEqual("1.0.0");

        results = await packageRepository.list({ filter: "GoodBye" });
        result = await packageRepository.get(results.Items[0].Id);

        expect(result.PackageId).toStrictEqual("GoodBye");
        expect(result.Version).toStrictEqual("2.0.0");
    });

    test("failed package", async () => {
        const packageRepository = new PackageRepository(client, space.Name);
        try {
            await packageRepository.push([path.join(tempOutDir, `Hello.1.0.0.zip`)], OverwriteMode.FailIfExists);
            await packageRepository.push([path.join(tempOutDir, `Hello.1.0.0.zip`)], OverwriteMode.FailIfExists);
        } catch (error) {
            expect(error).toBeDefined();
            if (error instanceof Error) {
                expect(error.message).toContain(`rejected`);
            }
        }
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
        console.log(`Space '${space.Name}' deleted successfully.`);
    });
});
