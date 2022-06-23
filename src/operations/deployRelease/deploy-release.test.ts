import {
    CommunicationStyle,
    DeploymentTargetResource,
    EnvironmentResource,
    NewDeploymentTarget,
    NewEndpoint,
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
import { deployRelease } from "./deploy-release";

describe("deploy a release", () => {
    let space: SpaceResource;
    let project: ProjectResource;
    let environment: EnvironmentResource;
    let systemRepository: Repository;
    let repository: OctopusSpaceRepository;
    let machine: DeploymentTargetResource;
    const randomConfig: Config = { dictionaries: [starWars] };

    jest.setTimeout(100000);

    function uniqueName() {
        return uniqueNamesGenerator(randomConfig).substring(0, 20);
    }

    beforeEach(async () => {
        const client = await Client.create();
        systemRepository = new Repository(client);
        const user = await systemRepository.users.getCurrent();

        const spaceName = uniqueName();
        console.log(`Creating ${spaceName} space...`);

        space = await systemRepository.spaces.create(NewSpace(spaceName, undefined, [user]));
        repository = await systemRepository.forSpace(space);

        const projectGroup = (await repository.projectGroups.list({ take: 1 })).Items[0];
        const lifecycle = (await repository.lifecycles.list({ take: 1 })).Items[0];
        const projectName = uniqueName();

        console.log(`Creating ${projectName} project...`);
        project = await repository.projects.create(NewProject(projectName, projectGroup, lifecycle));

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
        console.log("Updating deployment process...");
        await repository.deploymentProcesses.saveToProject(project, deploymentProcess);

        console.log("Creating environment...");
        environment = await repository.environments.create({ Name: uniqueName() });

        console.log("Creating machine...");

        const machineName = uniqueName();

        machine = await repository.machines.create(
            NewDeploymentTarget(
                machineName,
                NewEndpoint(machineName, CommunicationStyle.None),
                [environment],
                ["deploy"],
                TenantedDeploymentMode.TenantedOrUntenanted
            )
        );
    });

    test("deploy to single environment", async () => {
        await createRelease(space, project);
        await deployRelease(space, project, "latest", [environment.Name], undefined, false, { waitForDeployment: true });
    });

    afterEach(async () => {
        if (space === undefined || space === null) return;

        console.log(`Deleting ${space.Name} space...`);
        space.TaskQueueStopped = true;
        await systemRepository.spaces.modify(space);
        await systemRepository.spaces.del(space);
    });
});
