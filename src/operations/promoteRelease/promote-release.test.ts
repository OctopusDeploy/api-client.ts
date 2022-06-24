import {
    CommunicationStyle,
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
} from "@octopusdeploy/message-contracts";
import { PackageRequirement } from "@octopusdeploy/message-contracts/dist/deploymentStepResource";
import { RunConditionForAction } from "@octopusdeploy/message-contracts/dist/runConditionForAction";
import { Config, starWars, uniqueNamesGenerator } from "unique-names-generator";
import { Client } from "../../client";
import { OctopusSpaceRepository, Repository } from "../../repository";
import { createRelease } from "../createRelease/create-release";
import { deployRelease } from "../deployRelease/deploy-release";
import { promoteRelease } from "./promote-release";

describe("promote a release", () => {
    let client: Client;
    let environment1: EnvironmentResource;
    let environment2: EnvironmentResource;
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

        const environment1Name = uniqueName();
        console.log(`Creating environment, "${environment1Name}"...`);
        environment1 = await repository.environments.create({ Name: environment1Name });
        console.log(`Environment "${environment1.Name}" created successfully.`);

        const environment2Name = uniqueName();
        console.log(`Creating environment, "${environment2Name}"...`);
        environment2 = await repository.environments.create({ Name: environment2Name });
        console.log(`Environment "${environment2.Name}" created successfully.`);

        const machineName = uniqueName();
        console.log(`Creating machine, "${machineName}"...`);
        machine = await repository.machines.create(
            NewDeploymentTarget(
                machineName,
                NewEndpoint(machineName, CommunicationStyle.None),
                [environment1, environment2],
                ["deploy"],
                TenantedDeploymentMode.TenantedOrUntenanted
            )
        );
        console.log(`Machine "${machine.Name}" created successfully.`);
    });

    test("promote to single environment", async () => {
        await createRelease(repository, project);
        await deployRelease(repository, project, "latest", [environment1], undefined, false, { waitForDeployment: true });
        await promoteRelease(repository, project, environment1, [environment2], true, true, { waitForDeployment: true });
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
