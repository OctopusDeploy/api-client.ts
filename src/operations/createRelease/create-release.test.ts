import {
    NewProject,
    NewSpace,
    ProjectResource,
    RunCondition,
    SpaceResource,
    StartTrigger,
    UserResource,
} from "@octopusdeploy/message-contracts";
import { PackageRequirement } from "@octopusdeploy/message-contracts/dist/deploymentStepResource";
import { RunConditionForAction } from "@octopusdeploy/message-contracts/dist/runConditionForAction";
import AdmZip from "adm-zip";
import { randomUUID } from "crypto";
import { mkdtemp, readdir, rm } from "fs/promises";
import { tmpdir } from "os";
import path from "path";
import { Client } from "../../client";
import { processConfiguration } from "../../clientConfiguration.test";
import { OctopusSpaceRepository, Repository } from "../../repository";
import { createRelease, CreateReleaseCommandV1 } from "./create-release";
import { pushPackage } from "../pushPackage";
import { EnvironmentRepository, DeploymentEnvironment } from "../../features/deploymentEnvironments";

describe("create a release", () => {
    let client: Client;
    let environment: DeploymentEnvironment;
    let project: ProjectResource;
    let repository: OctopusSpaceRepository;
    let space: SpaceResource;
    let systemRepository: Repository;
    let user: UserResource;

    jest.setTimeout(100000);

    beforeAll(async () => {
        client = await Client.create(processConfiguration());
        console.log(`Client connected to API endpoint successfully.`);
        systemRepository = new Repository(client);
        user = await systemRepository.users.getCurrent();
    });

    beforeEach(async () => {
        const spaceName = randomUUID().substring(0, 20);
        console.log(`Creating space, "${spaceName}"...`);
        space = await systemRepository.spaces.create(NewSpace(spaceName, [], [user]));
        console.log(`Space "${spaceName}" created successfully.`);

        repository = await systemRepository.forSpace(space);

        const projectGroup = (await repository.projectGroups.list({ take: 1 })).Items[0];
        const lifecycle = (await repository.lifecycles.list({ take: 1 })).Items[0];

        const projectName = randomUUID();
        console.log(`Creating project, "${projectName}"...`);
        project = await repository.projects.create(NewProject(projectName, projectGroup, lifecycle));
        console.log(`Project "${projectName}" created successfully.`);

        const deploymentProcess = await repository.deploymentProcesses.get(project.DeploymentProcessId, undefined);
        deploymentProcess.Steps = [
            {
                Condition: RunCondition.Success,
                Links: {},
                PackageRequirement: PackageRequirement.LetOctopusDecide,
                StartTrigger: StartTrigger.StartAfterPrevious,
                Id: "",
                Name: randomUUID(),
                Properties: { },
                Actions: [
                    {
                        Id: "",
                        Name: "Run a Script",
                        ActionType: "Octopus.Script",
                        Notes: null,
                        IsDisabled: false,
                        CanBeUsedForProjectVersioning: false,
                        IsRequired: false,
                        WorkerPoolId: null,
                        Container: {
                            Image: null,
                            FeedId: null,
                        },
                        WorkerPoolVariable: "",
                        Environments: [],
                        ExcludedEnvironments: [],
                        Channels: [],
                        TenantTags: [],
                        Packages: [],
                        Condition: RunConditionForAction.Success,
                        Properties: {
                            "Octopus.Action.RunOnServer": "true",
                            "Octopus.Action.Script.ScriptSource": "Inline",
                            "Octopus.Action.Script.Syntax": "Bash",
                            "Octopus.Action.Script.ScriptBody": "echo 'hello'",
                        },
                        Links: {},
                    },
                ],
            },
        ];

        console.log(`Updating deployment process, "${deploymentProcess.Id}"...`);
        await repository.deploymentProcesses.saveToProject(project, deploymentProcess);
        console.log(`Deployment process, "${deploymentProcess.Id}" updated successfully.`);

        const environmentName = randomUUID();
        console.log(`Creating environment, "${environmentName}"...`);
        const envRepository = new EnvironmentRepository(client, spaceName);
        environment = await envRepository.create({ name: environmentName });
        console.log(`Environment "${environment.name}" created successfully.`);
    });

    test("can create a release", async () => {
        var command = {
            spaceName: space.Name,
            projectName: project.Name,
        } as CreateReleaseCommandV1;
        var response = await createRelease(client, command);
        expect(response.releaseId).toBeTruthy();
        expect(response.releaseVersion).toBeTruthy();
    });

    describe("create with packages", () => {
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
        });

        beforeEach(async () => {
            const feedId = (await repository.feeds.list({ take: 1 })).Items[0].Id;

            const deploymentProcess = await repository.deploymentProcesses.get(project.DeploymentProcessId, undefined);
            deploymentProcess.Steps = [
                {
                    Condition: RunCondition.Success,
                    Links: {},
                    PackageRequirement: PackageRequirement.LetOctopusDecide,
                    StartTrigger: StartTrigger.StartAfterPrevious,
                    Id: "",
                    Name: randomUUID(),
                    Properties: { "Octopus.Action.TargetRoles": "deploy" },
                    Actions: [
                        {
                            Id: "",
                            Name: "Run a Script",
                            ActionType: "Octopus.Script",
                            Notes: null,
                            IsDisabled: false,
                            CanBeUsedForProjectVersioning: false,
                            IsRequired: false,
                            WorkerPoolId: null,
                            Container: {
                                Image: null,
                                FeedId: null,
                            },
                            WorkerPoolVariable: "",
                            Environments: [],
                            ExcludedEnvironments: [],
                            Channels: [],
                            TenantTags: [],
                            Packages: packages.map((p) => ({
                                Name: p.split(":")[0],
                                FeedId: feedId,
                                PackageId: p.split(":")[0],
                                AcquisitionLocation: "Server",
                                Properties: { Extract: "False", SelectionMode: "immediate", Purpose: "" },
                                Id: "",
                            })),
                            Condition: RunConditionForAction.Success,
                            Properties: {
                                "Octopus.Action.RunOnServer": "false",
                                "Octopus.Action.Script.ScriptSource": "Inline",
                                "Octopus.Action.Script.Syntax": "Bash",
                                "Octopus.Action.Script.ScriptBody": "echo 'hello'",
                            },
                            Links: {},
                        },
                    ],
                },
            ];
            console.log(`Updating deployment process, "${deploymentProcess.Id}"...`);
            await repository.deploymentProcesses.saveToProject(project, deploymentProcess);
            console.log(`Deployment process, "${deploymentProcess.Id}" updated successfully.`);

            for (const file of await readdir(tempOutDir)) {
                await pushPackage(client, space.Name, [path.join(tempOutDir, file)])
            }
        });

        afterAll(async () => {
            await rm(tempOutDir, { recursive: true });
        });

        test("using packages", async () => {
            var command = {
                spaceName: space.Name,
                projectName: project.Name,
                packages: packages,
            } as CreateReleaseCommandV1;
            var response = await createRelease(repository.client, command);
            expect(response.releaseId).toBeTruthy();
            expect(response.releaseVersion).toBeTruthy();
        });
    });

    afterEach(async () => {
        if (space === undefined || space === null) return;

        console.log(`Deleting space, ${space.Name}...`);
        space.TaskQueueStopped = true;
        await systemRepository.spaces.modify(space);
        await systemRepository.spaces.del(space);
        console.log(`Space '${space.Name}' deleted successfully.`);
    });
});
