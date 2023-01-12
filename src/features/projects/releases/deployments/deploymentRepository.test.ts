/* eslint-disable @typescript-eslint/init-declarations */
import { PackageRequirement, RunCondition, RunConditionForAction, StartTrigger } from "../../deploymentProcesses";
import { randomUUID } from "crypto";
import { Client } from "../../../../client";
import { processConfiguration } from "../../../../clientConfiguration.test";
import { DeploymentEnvironment, EnvironmentRepository } from "../../../../features/deploymentEnvironments";
import { ServerTask, ServerTaskWaiter } from "../../../../features/serverTasks";
import { ReleaseRepository, CreateReleaseCommandV1 } from "../../../projects/releases";
import { CreateDeploymentUntenantedCommandV1 } from "./createDeploymentUntenantedCommandV1";
import { DeploymentRepository } from "./deploymentRepository";
import { Space, SpaceRepository } from "../../../spaces";
import { Project, NewProject, ProjectRepository } from "../../../projects";
import { UserProjection, userGetCurrent } from "../../../users";
import { ProjectGroupRepository } from "../../../projectGroups";
import { DeploymentProcessRepository } from "../../../projects/deploymentProcesses";
import { LifecycleRepository } from "../../../lifecycles";

describe("deploy a release", () => {
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
                            "Octopus.Action.Script.Syntax": "PowerShell",
                            "Octopus.Action.Script.ScriptBody": "Write-Host 'hello'",
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

    test("deploy to single environment", async () => {
        const releaseCommand: CreateReleaseCommandV1 = {
            spaceName: space.Name,
            ProjectName: project.Name,
        };
        const releaseRepository = new ReleaseRepository(client, space.Name);
        const releaseResponse = await releaseRepository.create(releaseCommand);

        const deployCommand: CreateDeploymentUntenantedCommandV1 = {
            spaceName: space.Name,
            ProjectName: project.Name,
            ReleaseVersion: releaseResponse.ReleaseVersion,
            EnvironmentNames: [environment.Name],
        };
        const deploymentRepository = new DeploymentRepository(client, space.Name);
        const response = await deploymentRepository.create(deployCommand);
        const deployments = await deploymentRepository.list({ ids: response.DeploymentServerTasks.map((t) => t.DeploymentId) });
        expect(deployments.Items.length).toBe(1);

        const taskIds = response.DeploymentServerTasks.map((x) => x.ServerTaskId);
        const e = new ServerTaskWaiter(client, space.Name);

        await e.waitForServerTasksToComplete(taskIds, 1000, 600000, (serverTask: ServerTask): void => {
            console.log(`Waiting for task ${serverTask.Id}. Current status: ${serverTask.State}`);
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
