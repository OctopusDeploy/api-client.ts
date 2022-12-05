/* eslint-disable @typescript-eslint/init-declarations */
import { PackageRequirement, RunCondition, RunConditionForAction, StartTrigger } from "../deploymentProcesses";
import AdmZip from "adm-zip";
import { randomUUID } from "crypto";
import { mkdtemp, readdir, rm } from "fs/promises";
import { tmpdir } from "os";
import path from "path";
import { Client } from "../../../client";
import { processConfiguration } from "../../../clientConfiguration.test";
import { ReleaseRepository, CreateReleaseCommandV1 } from ".";
import { PackageRepository } from "../../packages";
import { EnvironmentRepository, DeploymentEnvironment } from "../../deploymentEnvironments";
import { Space, SpaceRepository } from "../../spaces";
import { Project, NewProject, ProjectRepository } from "../../projects";
import { UserProjection, userGetCurrent } from "../../users";
import { ProjectGroupRepository } from "../../projectGroups";
import { DeploymentProcessRepository } from "../../projects/deploymentProcesses";
import { LifecycleRepository } from "../../lifecycles";
import { FeedRepository } from "../../feeds/feedRepository";

describe("create a release", () => {
    let client: Client;
    let environment: DeploymentEnvironment;
    let project: Project;
    let space: Space;
    let user: UserProjection;

    jest.setTimeout(100000);

    beforeAll(async () => {
        client = await Client.create(processConfiguration());
        console.log(`Client connected to API endpoint successfully.`);
        user = await userGetCurrent(client);
    });

    beforeEach(async () => {
        const spaceName = randomUUID().substring(0, 20);
        console.log(`Creating space, "${spaceName}"...`);
        const spaceRepository = new SpaceRepository(client);
        space = await spaceRepository.create({ Name: spaceName, SpaceManagersTeams: [], SpaceManagersTeamMembers: [user.Id], IsDefault: false });
        console.log(`Space "${spaceName}" created successfully.`);

        const projectGroup = (await new ProjectGroupRepository(client, spaceName).list({ take: 1 })).Items[0];
        const lifecycle = (await new LifecycleRepository(client, spaceName).list({ take: 1 })).Items[0];

        const projectName = randomUUID();
        console.log(`Creating project, "${projectName}"...`);
        project = await new ProjectRepository(client, spaceName).create(NewProject(projectName, projectGroup, lifecycle));
        console.log(`Project "${projectName}" created successfully.`);

        const deploymentProcessRepository = new DeploymentProcessRepository(client, space.Name);
        const deploymentProcess = await deploymentProcessRepository.get(project);
        deploymentProcess.Steps = [
            {
                Condition: RunCondition.Success,
                PackageRequirement: PackageRequirement.LetOctopusDecide,
                StartTrigger: StartTrigger.StartAfterPrevious,
                Id: "",
                Name: randomUUID(),
                Properties: {},
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
                    },
                ],
            },
        ];

        console.log(`Updating deployment process, "${deploymentProcess.Id}"...`);
        await deploymentProcessRepository.update(project, deploymentProcess);
        console.log(`Deployment process, "${deploymentProcess.Id}" updated successfully.`);

        const environmentName = randomUUID();
        console.log(`Creating environment, "${environmentName}"...`);
        const envRepository = new EnvironmentRepository(client, spaceName);
        environment = await envRepository.create({ Name: environmentName });
        console.log(`Environment "${environment.Name}" created successfully.`);
    });

    test("can create a release", async () => {
        const command: CreateReleaseCommandV1 = {
            spaceName: space.Name,
            ProjectName: project.Name,
        };
        const releaseRepository = new ReleaseRepository(client, space.Name);
        const response = await releaseRepository.create(command);
        expect(response.ReleaseId).toBeTruthy();
        expect(response.ReleaseVersion).toBeTruthy();
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
            const feedId = (await new FeedRepository(client, space.Name).list({ take: 1 })).Items[0].Id;

            const deploymentProcessRepository = new DeploymentProcessRepository(client, space.Name);
            const deploymentProcess = await deploymentProcessRepository.get(project);
            deploymentProcess.Steps = [
                {
                    Condition: RunCondition.Success,
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
                        },
                    ],
                },
            ];
            console.log(`Updating deployment process, "${deploymentProcess.Id}"...`);
            await deploymentProcessRepository.update(project, deploymentProcess);
            console.log(`Deployment process, "${deploymentProcess.Id}" updated successfully.`);

            const packageRepository = new PackageRepository(client, space.Name);
            for (const file of await readdir(tempOutDir)) {
                await packageRepository.push([path.join(tempOutDir, file)]);
            }
        });

        afterAll(async () => {
            await rm(tempOutDir, { recursive: true });
        });

        test("using packages", async () => {
            const command: CreateReleaseCommandV1 = {
                spaceName: space.Name,
                ProjectName: project.Name,
                Packages: packages,
            };
            const releaseRepository = new ReleaseRepository(client, space.Name);
            const response = await releaseRepository.create(command);
            expect(response.ReleaseId).toBeTruthy();
            expect(response.ReleaseVersion).toBeTruthy();
        });
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
