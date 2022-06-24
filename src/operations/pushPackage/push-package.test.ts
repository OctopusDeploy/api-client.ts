import { NewSpace, SpaceResource } from "@octopusdeploy/message-contracts";
import AdmZip from "adm-zip";
import { mkdtemp, rm } from "fs/promises";
import { tmpdir } from "os";
import path from "path";
import { Config, starWars, uniqueNamesGenerator } from "unique-names-generator";
import { Client } from "../../client";
import { OverwriteMode } from "../../repositories/packageRepository";
import { OctopusSpaceRepository, Repository } from "../../repository";
import { PackageIdentity } from "../createRelease/package-identity";
import { pushPackage } from "./push-package";

describe("push package", () => {
    let client: Client;
    let space: SpaceResource;
    let systemRepository: Repository;
    let repository: OctopusSpaceRepository;
    const randomConfig: Config = { dictionaries: [starWars] };

    jest.setTimeout(100000);

    function uniqueName() {
        return uniqueNamesGenerator(randomConfig).substring(0, 20);
    }

    let tempOutDir: string;
    const packages: PackageIdentity[] = [new PackageIdentity("Hello", "1.0.0"), new PackageIdentity("GoodBye", "2.0.0")];

    beforeAll(async () => {
        tempOutDir = await mkdtemp(path.join(tmpdir(), "octopus_"));

        const zip = new AdmZip();
        zip.addFile("test.txt", Buffer.from("inner content of the file", "utf8"));

        for (const p of packages) {
            const packagePath = path.join(tempOutDir, `${p.id}.${p.version}.zip`);
            zip.writeZip(packagePath);
        }

        client = await Client.create();
        console.log(`Client connected to API endpoint successfully.`);
        systemRepository = new Repository(client);
    });

    beforeEach(async () => {
        const user = await systemRepository.users.getCurrent();

        const spaceName = uniqueName();
        console.log(`Creating space, "${spaceName}"...`);
        space = await systemRepository.spaces.create(NewSpace(spaceName, undefined, [user]));
        repository = await systemRepository.forSpace(space);
    });

    test("single package", async () => {
        await pushPackage(space, [path.join(tempOutDir, `Hello.1.0.0.zip`)], OverwriteMode.OverwriteExisting);

        const results = await repository.packages.list({ filter: "Hello" });
        const result = await repository.packages.get(results.Items[0].Id);

        expect(result.PackageId).toStrictEqual("Hello");
        expect(result.Version).toStrictEqual("1.0.0");
    });

    test("multiple packages", async () => {
        await pushPackage(space, [path.join(tempOutDir, `Hello.1.0.0.zip`), path.join(tempOutDir, `GoodBye.2.0.0.zip`)], OverwriteMode.OverwriteExisting);

        let results = await repository.packages.list({ filter: "Hello" });
        let result = await repository.packages.get(results.Items[0].Id);

        expect(result.PackageId).toStrictEqual("Hello");
        expect(result.Version).toStrictEqual("1.0.0");

        results = await repository.packages.list({ filter: "GoodBye" });
        result = await repository.packages.get(results.Items[0].Id);

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
        await systemRepository.spaces.modify(space);
        await systemRepository.spaces.del(space);
    });
});
