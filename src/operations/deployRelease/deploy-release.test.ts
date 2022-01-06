import {ClientConfiguration} from "../../clientConfiguration";
import {
    CommunicationStyle,
    DeploymentTargetResource,
    EnvironmentResource, NewDeploymentTargetResource,
    ProjectResource, RunCondition,
    SpaceResource, StartTrigger, TenantedDeploymentMode
} from "@octopusdeploy/message-contracts";
import {OctopusSpaceRepository, Repository} from "../../repository";
import {Config, starWars, uniqueNamesGenerator} from "unique-names-generator";
import {Client} from "../../client";
import {PackageRequirement} from "@octopusdeploy/message-contracts/dist/deploymentStepResource";
import {RunConditionForAction} from "@octopusdeploy/message-contracts/dist/runConditionForAction";
import {createRelease} from "../createRelease/create-release";
import {deployRelease} from "./deploy-release";

describe("deploy a release", () => {
    let configuration: ClientConfiguration;
    let serverEndpoint: string;
    let space: SpaceResource;
    let project: ProjectResource;
    let environment: EnvironmentResource;
    let systemRepository: Repository;
    let repository: OctopusSpaceRepository;
    let machine: DeploymentTargetResource;
    const randomConfig: Config = {dictionaries: [starWars]};

    jest.setTimeout(100000);

    function uniqueName() {
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

        const groupId = (await repository.projectGroups.list({take: 1})).Items[0].Id;
        const lifecycleId = (await repository.lifecycles.list({take: 1})).Items[0].Id;
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
                Properties: {"Octopus.Action.TargetRoles": "deploy"},
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
        environment = await repository.environments.create({Name: uniqueName()});

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
        await createRelease(configuration, space.Id, project.Name);

        await deployRelease(configuration, space.Id, project.Name, "latest", [environment.Name], undefined, false, {
            waitForDeployment: true
        });
    });

    afterEach(async () => {
        console.log(`Deleting ${space.Name} space`);
        space.TaskQueueStopped = true;
        await systemRepository.spaces.modify(space);
        await systemRepository.spaces.del(space);
    });
});