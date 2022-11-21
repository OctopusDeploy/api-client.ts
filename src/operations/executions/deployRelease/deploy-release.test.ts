import { NewProject, NewSpace, ProjectResource, RunCondition, SpaceResource, StartTrigger, UserResource } from "@octopusdeploy/message-contracts";
import { PackageRequirement } from "@octopusdeploy/message-contracts/dist/deploymentStepResource";
import { RunConditionForAction } from "@octopusdeploy/message-contracts/dist/runConditionForAction";
import { randomUUID } from "crypto";
import { Client } from "../../../client";
import { processConfiguration } from "../../../clientConfiguration.test";
import { DeploymentRepository } from "../../../features";
import { DeploymentEnvironment, EnvironmentRepository } from "../../../features/deploymentEnvironments";
import { ServerTaskDetails } from "../../../features/serverTasks";
import { OctopusSpaceRepository, Repository } from "../../../repository";
import { createRelease, CreateReleaseCommandV1 } from "../../createRelease/create-release";
import { ExecutionWaiter } from "../execution-waiter";
import { CreateDeploymentUntenantedCommandV1 } from "./createDeploymentUntenantedCommandV1";
import { deployReleaseUntenanted } from "./deploy-release";

describe("deploy a release", () => {
    let client: Client;
    let environment: DeploymentEnvironment;
    let project: ProjectResource;
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

        const repository = await systemRepository.forSpace(space);

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
        environment = await envRepository.create({ Name: environmentName });
        console.log(`Environment "${environment.Name}" created successfully.`);
    });

    test("deploy to single environment", async () => {
        const releaseCommand: CreateReleaseCommandV1 = {
            spaceName: space.Name,
            ProjectName: project.Name,
        };
        const releaseResponse = await createRelease(client, releaseCommand);

        const deployCommand: CreateDeploymentUntenantedCommandV1 = {
            spaceName: space.Name,
            ProjectName: project.Name,
            ReleaseVersion: releaseResponse.ReleaseVersion,
            EnvironmentNames: [environment.Name],
        };
        const response = await deployReleaseUntenanted(client, deployCommand);

        const deploymentRepository = new DeploymentRepository(client, space.Name);
        const deployments = await deploymentRepository.list({ ids: response.DeploymentServerTasks.map((t) => t.deploymentId) });
        expect(deployments.Items.length).toBe(1);

        const taskIds = response.DeploymentServerTasks.map((x) => x.serverTaskId);
        const e = new ExecutionWaiter(client, space.Name);

        await e.waitForExecutionToComplete(taskIds, false, true, undefined, 1000, 600000, "task", (serverTaskDetails: ServerTaskDetails): void => {
            console.log(
                `Waiting for task ${serverTaskDetails.Task.Id}. Current status: ${serverTaskDetails.Task.State}, completed: ${serverTaskDetails.Progress.ProgressPercentage}%`
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
