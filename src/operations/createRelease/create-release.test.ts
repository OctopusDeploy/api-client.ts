import {
    CommunicationStyle,
    ControlType,
    DeploymentTargetResource,
    EnvironmentResource,
    NewDeploymentTarget,
    NewEndpoint,
    NewProject,
    NewSpace,
    ProjectResource,
    RunCondition,
    SpaceResource,
    StartTrigger,
    TenantedDeploymentMode,
    VariableType,
} from "@octopusdeploy/message-contracts";
import { PackageRequirement } from "@octopusdeploy/message-contracts/dist/deploymentStepResource";
import { RunConditionForAction } from "@octopusdeploy/message-contracts/dist/runConditionForAction";
import AdmZip from "adm-zip";
import { mkdtemp, readdir, readFile, rm } from "fs/promises";
import moment from "moment";
import { tmpdir } from "os";
import path from "path";
import { Config, starWars, uniqueNamesGenerator } from "unique-names-generator";
import { Client } from "../../client";
import { OctopusSpaceRepository, Repository } from "../../repository";
import { createRelease } from "./create-release";
import { PackageIdentity } from "./package-identity";

describe("create a release", () => {
    let client: Client;
    let environment: EnvironmentResource;
    let machine: DeploymentTargetResource;
    let project: ProjectResource;
    let repository: OctopusSpaceRepository;
    let space: SpaceResource;
    let systemRepository: Repository;
    const randomConfig: Config = { dictionaries: [starWars] };

    jest.setTimeout(100000);

    function uniqueName() {
        return uniqueNamesGenerator(randomConfig).substring(0, 20);
    }

    beforeAll(async () => {
        client = await Client.create();
        console.log(`Client connected to API endpoint successfully.`);
        systemRepository = new Repository(client);
    });

    beforeEach(async () => {
        const user = await systemRepository.users.getCurrent();

        const spaceName = uniqueName();
        console.log(`Creating space, "${spaceName}"...`);
        space = await systemRepository.spaces.create(NewSpace(spaceName, undefined, [user]));
        console.log(`Space "${spaceName}" created successfully.`);

        repository = await systemRepository.forSpace(space);

        const projectGroup = (await repository.projectGroups.list({ take: 1 })).Items[0];
        const lifecycle = (await repository.lifecycles.list({ take: 1 })).Items[0];

        const projectName = uniqueName();
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

        console.log(`Updating deployment process, "${deploymentProcess.Id}"...`);
        await repository.deploymentProcesses.saveToProject(project, deploymentProcess);
        console.log(`Deployment process, "${deploymentProcess.Id}" updated successfully.`);

        const environmentName = uniqueName();
        console.log(`Creating environment, "${environmentName}"...`);
        environment = await repository.environments.create({ Name: environmentName });
        console.log(`Environment "${environment.Name}" created successfully.`);

        const machineName = uniqueName();
        console.log(`Creating machine, "${machineName}"...`);
        machine = await repository.machines.create(
            NewDeploymentTarget(
                machineName,
                NewEndpoint(machineName, CommunicationStyle.None),
                [environment],
                ["deploy"],
                TenantedDeploymentMode.TenantedOrUntenanted
            )
        );
        console.log(`Machine "${machine.Name}" created successfully.`);
    });

    test("deploy to single environment", async () => {
        await createRelease(repository, project, undefined, {
            deployTo: [environment],
            waitForDeployment: true,
        });
    });

    test("deploy to multiple environments", async () => {
        const environment2Name = uniqueName();
        console.log(`Creating environment, "${environment2Name}"...`);
        const environment2 = await repository.environments.create({ Name: environment2Name });

        console.log(`Adding environment, ${environment2Name} to machine, ${machine}...`);
        machine.EnvironmentIds = [environment2.Id, ...machine.EnvironmentIds];
        await repository.machines.modify(machine);

        const lifecycleName = "Development";
        const lifecycle = (await repository.lifecycles.list({ take: 1 })).Items[0];
        lifecycle.Phases = [
            {
                Id: "",
                Name: lifecycleName,
                OptionalDeploymentTargets: [environment2.Id, environment.Id],
                AutomaticDeploymentTargets: [],
                IsOptionalPhase: false,
                MinimumEnvironmentsBeforePromotion: 0,
                ReleaseRetentionPolicy: undefined,
                TentacleRetentionPolicy: undefined,
            },
        ];
        console.log(`Updating lifecycle, ${lifecycleName}...`);
        await repository.lifecycles.modify(lifecycle);

        await createRelease(repository, project, undefined, {
            deployTo: [environment, environment2],
            waitForDeployment: true,
        });
    });

    test("deploy to multiple tenants", async () => {
        project.TenantedDeploymentMode = TenantedDeploymentMode.Tenanted;
        await repository.projects.modify(project);

        const tenant1Name = uniqueName();
        console.log(`Creating tenant, "${tenant1Name}"...`);
        const tenant1 = await repository.tenants.create({
            Name: tenant1Name,
            ProjectEnvironments: { [project.Id]: [environment.Id] },
            TenantTags: [],
        });

        const tenant2Name = uniqueName();
        console.log(`Creating tenant, "${tenant2Name}"...`);
        const tenant2 = await repository.tenants.create({
            Name: tenant2Name,
            ProjectEnvironments: { [project.Id]: [environment.Id] },
            TenantTags: [],
        });

        console.log(`Associating tenants to machine, ${machine.Name}...`);
        machine.TenantIds = [tenant1.Id, tenant2.Id];
        await repository.machines.modify(machine);

        await createRelease(repository, project, undefined, {
            tenants: [tenant1, tenant2],
            deployTo: [environment],
            waitForDeployment: true,
        });
    });

    test("deploy to multiple tenants via tag", async () => {
        project.TenantedDeploymentMode = TenantedDeploymentMode.Tenanted;
        await repository.projects.modify(project);

        const tag = "deploy";

        const tagSet = await repository.tagSets.create({
            Id: "",
            Description: "",
            Links: {},
            Name: "tags",
            SortOrder: 0,
            Tags: [{ CanonicalTagName: `tags/${tag}`, Color: "#333333", Description: "", Id: "", Name: tag, SortOrder: 0 }],
        });

        const tenant1Name = uniqueName();
        console.log(`Creating tenant, "${tenant1Name}"...`);
        const tenant1 = await repository.tenants.create({
            Name: tenant1Name,
            ProjectEnvironments: { [project.Id]: [environment.Id] },
            TenantTags: [tagSet.Tags[0].CanonicalTagName],
        });

        const tenant2Name = uniqueName();
        console.log(`Creating tenant, "${tenant2Name}"...`);
        const tenant2 = await repository.tenants.create({
            Name: tenant2Name,
            ProjectEnvironments: { [project.Id]: [environment.Id] },
            TenantTags: [tagSet.Tags[0].CanonicalTagName],
        });

        machine.TenantIds = [tenant1.Id, tenant2.Id];
        await repository.machines.modify(machine);

        await createRelease(repository, project, undefined, {
            tenantTags: [tagSet.Tags[0].CanonicalTagName],
            deployTo: [environment],
            waitForDeployment: true,
        });
    });

    test("schedule a deployment in the future", async () => {
        const currentDate = new Date();
        const deployAt = moment(new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), 0, 0, 0, 0)).add(10, "days").toDate();
        const noDeployAfter = moment(new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), 0, 0, 0, 0)).add(11, "days").toDate();

        await createRelease(repository, project, undefined, {
            deployTo: [environment],
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

        await createRelease(repository, project, undefined, {
            deployTo: [environment],
            variable: [{ name: "Name", value: "John" }],
            waitForDeployment: true,
        });
    });

    test("deploy to single environment in non default channel", async () => {
        const channel = await repository.channels.createForProject(
            project,
            {
                Name: uniqueName(),
                LifecycleId: project.LifecycleId,
                IsDefault: false,
                ProjectId: project.Id,
                SpaceId: project.SpaceId,
            },
            {}
        );

        await createRelease(
            repository,
            project,
            { channel: channel },
            {
                deployTo: [environment],
                waitForDeployment: true,
            }
        );
    });

    test("deploy to single environment with a specified release number", async () => {
        await createRelease(
            repository,
            project,
            { releaseNumber: "1.2.3" },
            {
                deployTo: [environment],
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

            const deploymentProcess = await repository.deploymentProcesses.get(project.DeploymentProcessId, undefined);
            deploymentProcess.Steps = [
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
            console.log(`Updating deployment process, "${deploymentProcess.Id}"...`);
            await repository.deploymentProcesses.saveToProject(project, deploymentProcess);
            console.log(`Deployment process, "${deploymentProcess.Id}" updated successfully.`);

            for (const file of await readdir(tempOutDir)) {
                await uploadPackage(path.join(tempOutDir, file));
            }

            async function uploadPackage(filePath: string) {
                const buffer = await readFile(filePath);
                const fileName = path.basename(filePath);

                console.log(`Uploading package, "${fileName}"...`);
                await repository.packages.upload(new File([buffer], fileName));
                console.log(`Package, ${fileName} uploaded sucessfully.`);
            }
        });

        afterAll(async () => {
            await rm(tempOutDir, { recursive: true });
        });

        test("using packagesFolder", async () => {
            await createRelease(
                repository,
                project,
                { packagesFolder: tempOutDir },
                {
                    deployTo: [environment],
                    waitForDeployment: true,
                }
            );
        });

        test("using packages", async () => {
            await createRelease(
                repository,
                project,
                {
                    packages,
                },
                {
                    deployTo: [environment],
                    waitForDeployment: true,
                }
            );
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
