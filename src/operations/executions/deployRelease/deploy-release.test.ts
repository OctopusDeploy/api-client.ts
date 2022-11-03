import {
    CommunicationStyle,
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
    UserResource,
} from "@octopusdeploy/message-contracts";
import { PackageRequirement } from "@octopusdeploy/message-contracts/dist/deploymentStepResource";
import { RunConditionForAction } from "@octopusdeploy/message-contracts/dist/runConditionForAction";
import { randomUUID } from "crypto";
import { Client } from "../../../client";
import { OctopusSpaceRepository, Repository } from "../../../repository";
import { createRelease, CreateReleaseCommandV1 } from "../../createRelease/create-release";
import { CreateDeploymentUntenantedCommandV1 } from "./createDeploymentUntenantedCommandV1";
import { deployReleaseUntenanted } from "./deploy-release";

describe("deploy a release", () => {
    let client: Client;
    let environment: EnvironmentResource;
    let project: ProjectResource;
    let repository: OctopusSpaceRepository;
    let space: SpaceResource;
    let systemRepository: Repository;
    let user: UserResource;

    jest.setTimeout(100000);

    beforeAll(async () => {
        client = await Client.create();
        console.log(`Client connected to API endpoint successfully.`);
        systemRepository = new Repository(client);
        user = await systemRepository.users.getCurrent();
    });

    beforeEach(async () => {
        const spaceName = randomUUID().substring(0, 20);
        console.log(`Creating space, "${spaceName}"...`);
        space = await systemRepository.spaces.create(NewSpace(spaceName, undefined, [user]));
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

        const environmentName = randomUUID();
        console.log(`Creating environment, "${environmentName}"...`);
        environment = await repository.environments.create({ Name: environmentName });
        console.log(`Environment "${environment.Name}" created successfully.`);

        const machineName = randomUUID();
        console.log(`Creating machine, "${machineName}"...`);
        const machine = await repository.machines.create(
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
        var releaseCommand = {
            spaceId: space.Id,
            projectName: project.Name,
        } as CreateReleaseCommandV1;
        var releaseResponse = await createRelease(repository, releaseCommand);

        var deployCommand = {
            spaceId: space.Id,
            projectName: project.Name,
            releaseVersion: releaseResponse.releaseVersion,
            environmentNames: [environment.Name],
        } as CreateDeploymentUntenantedCommandV1;
        await deployReleaseUntenanted(repository, deployCommand);
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
