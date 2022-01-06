import { Config, starWars, uniqueNamesGenerator } from "unique-names-generator";
import { Client } from "../../client";
import { OctopusSpaceRepository, Repository } from "../../repository";
import { SpaceResource } from "@octopusdeploy/message-contracts";
import { ClientConfiguration } from "../../clientConfiguration";
import {mkdtemp, readFile, rm} from "fs/promises";
import { PackageIdentity } from "../createRelease/package-identity";
import path from "path";
import { tmpdir } from "os";
import AdmZip from "adm-zip";
import { pushBuildInformation } from "./push-build-information";

describe("push build information", () => {
    let configuration: ClientConfiguration;
    let serverEndpoint: string;
    let space: SpaceResource;
    let systemRepository: Repository;
    let repository: OctopusSpaceRepository;
    const randomConfig: Config = { dictionaries: [starWars] };

    jest.setTimeout(100000);

    function uniqueName() {
        return uniqueNamesGenerator(randomConfig).substring(0, 20);
    }

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
    });

    beforeEach(async () => {
        serverEndpoint = process.env.OCTOPUS_SERVER as string;

        configuration = {
            autoConnect: true,
            apiUri: serverEndpoint,
            apiKey: process.env.OCTOPUS_API_KEY as string,
        };

        const client = await Client.create(configuration);
        systemRepository = new Repository(client);
        const user = await systemRepository.users.getCurrent();

        const spaceName = uniqueName();
        console.log(`Creating ${spaceName} space`);
        space = await systemRepository.spaces.create({
            IsDefault: false,
            Name: spaceName,
            SpaceManagersTeamMembers: [user.Id],
            SpaceManagersTeams: [],
            TaskQueueStopped: false,
        });
        repository = await systemRepository.forSpace(space.Id);
    });

    test("to single package", async () => {
        await uploadPackage(path.join(tempOutDir, "Hello.1.0.0.zip"));

        async function uploadPackage(filePath: string) {
            const buffer = await readFile(filePath);
            const fileName = path.basename(filePath);

            console.log(`Uploading ${fileName} package`);
            await repository.packages.upload(new File([buffer], fileName));
        }

        await pushBuildInformation(configuration, space.Id, [{ id: "Hello", version: "1.0.0" }], {
            buildEnvironment: "BitBucket",
            branch: "main",
            buildNumber: "288",
            buildUrl: "https://bitbucket.org/octopussamples/petclinic/addon/pipelines/home#!/results/288",
            vcsType: "Git",
            vcsRoot: "http://bitbucket.org/octopussamples/petclinic",
            vcsCommitNumber: "314cf2c3ee916c92a384c2796a6abe332d678e4f",
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
        console.log(`Deleting ${space.Name} space`);
        space.TaskQueueStopped = true;
        await systemRepository.spaces.modify(space);
        await systemRepository.spaces.del(space);
    });
});