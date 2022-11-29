/* eslint-disable @typescript-eslint/init-declarations */
import AdmZip from "adm-zip";
import { randomUUID } from "crypto";
import { mkdtemp, rm } from "fs/promises";
import { tmpdir } from "os";
import path from "path";
import { Client } from "../../client";
import { processConfiguration } from "../../clientConfiguration.test";
import { OverwriteMode } from "../overwriteMode";
import { packagePush } from ".";
import { packageGet, packagesList, UserProjection } from "../..";
import { Space, SpaceRepository } from "../spaces";
import { userGetCurrent } from "../users/user-get-current";

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
        space = await spaceRepository.create({ Name: spaceName, SpaceManagersTeams: [], SpaceManagersTeamMembers: [user.Id] });
    });

    test("single package", async () => {
        await packagePush(client, space.Name, [path.join(tempOutDir, `Hello.1.0.0.zip`)], OverwriteMode.OverwriteExisting);

        const results = await packagesList(client, space.Name, { filter: "Hello" });
        const result = await packageGet(client, space.Name, results.Items[0].Id);

        expect(result.PackageId).toStrictEqual("Hello");
        expect(result.Version).toStrictEqual("1.0.0");
    });

    test("multiple packages", async () => {
        await packagePush(
            client,
            space.Name,
            [path.join(tempOutDir, `Hello.1.0.0.zip`), path.join(tempOutDir, `GoodBye.2.0.0.zip`)],
            OverwriteMode.OverwriteExisting
        );

        let results = await packagesList(client, space.Name, { filter: "Hello" });
        let result = await packageGet(client, space.Name, results.Items[0].Id);

        expect(result.PackageId).toStrictEqual("Hello");
        expect(result.Version).toStrictEqual("1.0.0");

        results = await packagesList(client, space.Name, { filter: "GoodBye" });
        result = await packageGet(client, space.Name, results.Items[0].Id);

        expect(result.PackageId).toStrictEqual("GoodBye");
        expect(result.Version).toStrictEqual("2.0.0");
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
