import {
    CommunicationStyle,
    DeploymentTargetResource,
    EnvironmentResource,
    NewDeploymentTargetResource,
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
import { ClientConfiguration } from "../../clientConfiguration";
import { OctopusSpaceRepository, Repository } from "../../repository";
import { createRelease } from "../createRelease/create-release";
import { deployRelease } from "../deployRelease/deploy-release";
import { promoteRelease } from "./promote-release";

describe("promote a release", () => {
    let configuration: ClientConfiguration;
    let space: SpaceResource;
    let project: ProjectResource;
    let environment1: EnvironmentResource;
    let environment2: EnvironmentResource;
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
        console.log(`Creating ${spaceName} space`);
        space = await systemRepository.spaces.create({
            IsDefault: false,
            Name: spaceName,
            SpaceManagersTeamMembers: [user.Id],
            SpaceManagersTeams: [],
            TaskQueueStopped: false,
        });
        repository = await systemRepository.forSpace(space);

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

        console.log("Creating environments");
        environment1 = await repository.environments.create({ Name: uniqueName() });
        environment2 = await repository.environments.create({ Name: uniqueName() });

        console.log("Creating machine");

        machine = await repository.machines.create({
            Endpoint: {
                CommunicationStyle: CommunicationStyle.None,
            },
            EnvironmentIds: [environment1.Id, environment2.Id],
            Name: uniqueName(),
            Roles: ["deploy"],
            TenantedDeploymentParticipation: TenantedDeploymentMode.TenantedOrUntenanted,
        } as NewDeploymentTargetResource);
    });

    test("promote to single environment", async () => {
        await createRelease(space, project);

        await deployRelease(space, project, "latest", [environment1.Name], undefined, false, {
            waitForDeployment: true,
        });

        await promoteRelease(space, project, environment1, [environment2.Name], true, true, { waitForDeployment: true });
    });

    afterEach(async () => {
        console.log(`Deleting ${space?.Name} space`);
        space.TaskQueueStopped = true;
        await systemRepository.spaces.modify(space);
        await systemRepository.spaces.del(space);
    });
});
