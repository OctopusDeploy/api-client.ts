import { createRelease } from "./create-release";
import { Client } from "../../client";
import { OctopusSpaceRepository, Repository } from "../../repository";
import { Config, starWars, uniqueNamesGenerator } from "unique-names-generator";
import {
    CommunicationStyle,
    ControlType,
    DeploymentTargetResource,
    EnvironmentResource,
    NewDeploymentTargetResource,
    NewTenantResource,
    ProjectResource,
    RunCondition,
    SpaceResource,
    StartTrigger,
    TenantedDeploymentMode,
    VariableType,
} from "@octopusdeploy/message-contracts";
import { ClientConfiguration } from "../../clientConfiguration";
import { PackageRequirement } from "@octopusdeploy/message-contracts/dist/deploymentStepResource";
import { RunConditionForAction } from "@octopusdeploy/message-contracts/dist/runConditionForAction";
import moment from "moment";
import AdmZip from "adm-zip";
import {mkdtemp, readdir, readFile, rm} from "fs/promises";
import { tmpdir } from "os";
import path from "path";
import { PackageIdentity } from "./package-identity";


describe("create a release", () => {
    let configuration: ClientConfiguration;
    let serverEndpoint: string;
    let space: SpaceResource;
    let project: ProjectResource;
    let environment: EnvironmentResource;
    let systemRepository: Repository;
    let repository: OctopusSpaceRepository;
    let machine: DeploymentTargetResource;
    const randomConfig: Config = { dictionaries: [starWars] };

    jest.setTimeout(100000);

    function uniqueName(){
        return uniqueNamesGenerator(randomConfig).substring(0, 20);
    }

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

        const groupId = (await repository.projectGroups.list({ take: 1 })).Items[0].Id;
        const lifecycleId = (await repository.lifecycles.list({ take: 1 })).Items[0].Id;
        const projectName = uniqueName();
        console.log(`Creating ${projectName} project`);
        project = await repository.projects.create({
            Description: "",
            LifecycleId: lifecycleId,
            Name: projectName,
            ProjectGroupId: groupId,
        });

        const dp = await repository.deploymentProcesses.get(project.DeploymentProcessId, undefined);
        dp.Steps = [
            {
                Condition: RunCondition.Success,
                Links: {},
                PackageRequirement: PackageRequirement.LetOctopusDecide,
                StartTrigger: StartTrigger.StartAfterPrevious,
                Id: "",
                Name: uniqueName(),
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
                        Packages: [],
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
        console.log("Updating process");
        await repository.deploymentProcesses.saveToProject(project, dp);

        console.log("Creating environment");
        environment = await repository.environments.create({ Name: uniqueName() });

        console.log("Creating machine");

        machine = await repository.machines.create({
            Endpoint: {
                CommunicationStyle: CommunicationStyle.None,
            },
            EnvironmentIds: [environment.Id],
            Name: uniqueName(),
            Roles: ["deploy"],
            TenantedDeploymentParticipation: TenantedDeploymentMode.TenantedOrUntenanted,
        } as NewDeploymentTargetResource);
    });

    test("deploy to single environment", async () => {
        await createRelease(configuration, space.Id, project.Name, undefined, {
            deployTo: [environment.Name],
            waitForDeployment: true,
        });
    });

    test("deploy to multiple environments", async () => {
        console.log("Creating environment");
        const environment2 = await repository.environments.create({ Name: uniqueName() });

        console.log("Creating machine");

        machine.EnvironmentIds = [environment2.Id, ...machine.EnvironmentIds];
        await repository.machines.modify(machine);

        const lifecycle = (await repository.lifecycles.list({ take: 1 })).Items[0];
        lifecycle.Phases = [
            {
                Id: "",
                Name: "Development",
                OptionalDeploymentTargets: [environment2.Id, environment.Id],
                AutomaticDeploymentTargets: [],
                IsOptionalPhase: false,
                MinimumEnvironmentsBeforePromotion: 0,
                ReleaseRetentionPolicy: undefined,
                TentacleRetentionPolicy: undefined,
            },
        ];
        await repository.lifecycles.modify(lifecycle);

        await createRelease(configuration, space.Id, project.Name, undefined, {
            deployTo: [environment.Name, environment2.Name],
            waitForDeployment: true,
        });
    });

    test("deploy to multiple tenants", async () => {
        project.TenantedDeploymentMode = TenantedDeploymentMode.Tenanted;
        await repository.projects.modify(project);

        let newTenantResource: NewTenantResource = { ProjectEnvironments: {}, TenantTags: [], Name: uniqueName() };
        newTenantResource.ProjectEnvironments[project.Id] = [environment.Id];
        const tenant1 = await repository.tenants.create(newTenantResource);

        newTenantResource = { ProjectEnvironments: {}, TenantTags: [], Name: uniqueName() };
        newTenantResource.ProjectEnvironments[project.Id] = [environment.Id];
        const tenant2 = await repository.tenants.create(newTenantResource);

        machine.TenantIds = [tenant1.Id, tenant2.Id];
        await repository.machines.modify(machine);

        await createRelease(configuration, space.Id, project.Name, undefined, {
            tenants: [tenant1.Id, tenant2.Id],
            deployTo: [environment.Name],
            waitForDeployment: true,
        });
    });

    test("deploy to multiple tenants via tag", async () => {
        const tag = "deploy";

        project.TenantedDeploymentMode = TenantedDeploymentMode.Tenanted;
        await repository.projects.modify(project);

        const tagSet = await repository.tagSets.create({
            Id: "",
            Description: "",
            Links: {},
            Name: "tags",
            SortOrder: 0,
            Tags: [{ CanonicalTagName: `tags/${tag}`, Color: "#333333", Description: "", Id: "", Name: tag, SortOrder: 0 }],
        });

        let newTenantResource: NewTenantResource = {
            ProjectEnvironments: {},
            TenantTags: [tagSet.Tags[0].CanonicalTagName],
            Name: uniqueName(),
        };
        newTenantResource.ProjectEnvironments[project.Id] = [environment.Id];
        const tenant1 = await repository.tenants.create(newTenantResource);

        newTenantResource = { ProjectEnvironments: {}, TenantTags: [tagSet.Tags[0].CanonicalTagName], Name: uniqueName() };
        newTenantResource.ProjectEnvironments[project.Id] = [environment.Id];
        const tenant2 = await repository.tenants.create(newTenantResource);

        machine.TenantIds = [tenant1.Id, tenant2.Id];
        await repository.machines.modify(machine);

        await createRelease(configuration, space.Id, project.Name, undefined, {
            tenantTags: [tagSet.Tags[0].CanonicalTagName],
            deployTo: [environment.Name],
            waitForDeployment: true,
        });
    });

    test("schedule a deployment in the future", async () => {
        const currentDate = new Date();
        const deployAt = moment(new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), 0, 0, 0, 0)).add(10, "days").toDate();
        const noDeployAfter = moment(new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), 0, 0, 0, 0)).add(11, "days").toDate();

        await createRelease(configuration, space.Id, project.Name, undefined, {
            deployTo: [environment.Name],
            deployAt,
            noDeployAfter,
            waitForDeployment: false,
        });
        const taskId = (await repository.deployments.list({ take: 1 })).Items[0].TaskId;
        const task = await repository.tasks.get(taskId);

        await repository.tasks.cancel(task);

        expect(task.QueueTime).toBeDefined();
        expect(task.QueueTimeExpiry).toBeDefined();
        expect(new Date(Date.parse(task.QueueTime as string)).toISOString()).toStrictEqual(deployAt.toISOString());
        expect(new Date(Date.parse(task.QueueTimeExpiry as string)).toISOString()).toStrictEqual(noDeployAfter.toISOString());
    });

    test("deploy to single environment with variables", async () => {
        const variableSet = await repository.variables.get(project.VariableSetId);
        variableSet.Variables = [
            {
                Id: "",
                Name: "Name",
                Type: VariableType.String,
                IsEditable: true,
                IsSensitive: false,
                Value: "",
                Description: "",
                Scope: {},
                Prompt: {
                    Label: "Name",
                    Required: true,
                    Description: "",
                    DisplaySettings: { "Octopus.ControlType": ControlType.SingleLineText },
                },
            },
        ];
        await repository.variables.modify(variableSet);

        await createRelease(configuration, space.Id, project.Name, undefined, {
            deployTo: [environment.Name],
            variable: [{ name: "Name", value: "John" }],
            waitForDeployment: true,
        });
    });

    test("deploy to single environment in non default channel", async () => {
        const channel = await repository.channels.createForProject(
            project,
            {
                Id: "",
                Name: uniqueName(),
                Description: "",
                LifecycleId: project.LifecycleId,
                TenantTags: [],
                IsDefault: false,
                Rules: [],
                Links: {},
                ProjectId: project.Id,
                SpaceId: project.SpaceId,
            },
            {}
        );

        await createRelease(
            configuration,
            space.Id,
            project.Name,
            { channel: channel.Name },
            {
                deployTo: [environment.Name],
                waitForDeployment: true,
            }
        );
    });

    test("deploy to single environment with a specified release number", async () => {
        await createRelease(
            configuration,
            space.Id,
            project.Name,
            { releaseNumber: "1.2.3" },
            {
                deployTo: [environment.Name],
                waitForDeployment: true,
            }
        );
    });

    describe("deploy to single environment with multiple packages", () => {
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
        });

        beforeEach(async () => {
            const feedId = (await repository.feeds.list({ take: 1 })).Items[0].Id;

            const dp = await repository.deploymentProcesses.get(project.DeploymentProcessId, undefined);
            dp.Steps = [
                {
                    Condition: RunCondition.Success,
                    Links: {},
                    PackageRequirement: PackageRequirement.LetOctopusDecide,
                    StartTrigger: StartTrigger.StartAfterPrevious,
                    Id: "",
                    Name: uniqueName(),
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
                                Name: p.id,
                                FeedId: feedId,
                                PackageId: p.id,
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
            console.log("Updating process");
            await repository.deploymentProcesses.saveToProject(project, dp);

            for (const file of await readdir(tempOutDir)) {
                await uploadPackage(path.join(tempOutDir, file));
            }

            async function uploadPackage(filePath: string) {
                const buffer = await readFile(filePath);
                const fileName = path.basename(filePath);

                console.log(`Uploading ${fileName} package`);
                await repository.packages.upload(new File([buffer], fileName));
            }
        });

        afterAll(async () => {
            await rm(tempOutDir, { recursive: true });
        });

        test("using packagesFolder", async () => {
            await createRelease(
                configuration,
                space.Id,
                project.Name,
                { packagesFolder: tempOutDir },
                {
                    deployTo: [environment.Name],
                    waitForDeployment: true,
                }
            );
        });

        test("using packages", async () => {
            await createRelease(
                configuration,
                space.Id,
                project.Name,
                {
                    packages,
                },
                {
                    deployTo: [environment.Name],
                    waitForDeployment: true,
                }
            );
        });
    });

    afterEach(async () => {
        space.TaskQueueStopped = true;
        await systemRepository.spaces.modify(space);
        await systemRepository.spaces.del(space);
    });
});
