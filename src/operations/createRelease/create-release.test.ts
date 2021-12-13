import { createRelease } from "./create-release";
import { Client } from "../../client";
import {OctopusSpaceRepository, Repository} from "../../repository";
import { Config, starWars, uniqueNamesGenerator } from "unique-names-generator";
import {
    CommunicationStyle,
    EnvironmentResource,
    NewDeploymentTargetResource,
    ProjectResource,
    RunCondition,
    SpaceResource,
    StartTrigger,
} from "@octopusdeploy/message-contracts";
import { ClientConfiguration } from "../../clientConfiguration";
import { PackageRequirement } from "@octopusdeploy/message-contracts/dist/deploymentStepResource";
import { RunConditionForAction } from "@octopusdeploy/message-contracts/dist/runConditionForAction";

describe("create a release tests", () => {
    let configuration: ClientConfiguration;
    let serverEndpoint: string;
    let space: SpaceResource;
    let project: ProjectResource;
    let environment: EnvironmentResource;
    let systemRepository: Repository;
    let repository: OctopusSpaceRepository;

    jest.setTimeout(100000);

    beforeEach(async () => {
        serverEndpoint = process.env.OCTOPUS_SERVER as string;

        configuration = {
            autoConnect: true,
            apiUri: serverEndpoint,
            apiKey: process.env.OCTOPUS_API_KEY as string,
        };

        const randomConfig: Config = { dictionaries: [starWars] };

        const client = await Client.create(configuration);
        systemRepository = new Repository(client);
        const user = await systemRepository.users.getCurrent();

        space = await systemRepository.spaces.create({
            IsDefault: false,
            Name: uniqueNamesGenerator(randomConfig),
            SpaceManagersTeamMembers: [user.Id],
            SpaceManagersTeams: [],
            TaskQueueStopped: false,
        });
        repository = await systemRepository.forSpace(space.Id);

        const groupId = (await repository.projectGroups.list({ take: 1 })).Items[0].Id;
        const lifecycleId = (await repository.lifecycles.list({ take: 1 })).Items[0].Id;
        project = await repository.projects.create({
            Description: "",
            LifecycleId: lifecycleId,
            Name: uniqueNamesGenerator(randomConfig),
            ProjectGroupId: groupId,
        });

        const dp = await repository.deploymentProcesses.get(project.DeploymentProcessId, undefined);
        dp.Steps = [{
            Condition: RunCondition.Success,
            Links: {},
            PackageRequirement: PackageRequirement.LetOctopusDecide,
            StartTrigger: StartTrigger.StartAfterPrevious,
            Id: "",
            Name: uniqueNamesGenerator(randomConfig),
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
        }];
        await repository.deploymentProcesses.saveToProject(project, dp);

        environment = await repository.environments.create({ Name: uniqueNamesGenerator(randomConfig) });
        await repository.machines.create({
            Endpoint: {
                CommunicationStyle: CommunicationStyle.None,
            },
            EnvironmentIds: [environment.Id],
            Name: uniqueNamesGenerator(randomConfig),
            Roles: ["deploy"],
        } as NewDeploymentTargetResource);
    });

    test("create a release and deploy to single environment", async () => {
        await createRelease(configuration, serverEndpoint, space.Id, project.Name, undefined, { deployTo: [environment.Name], waitForDeployment: true });
    });

    afterEach(async () => {
        space.TaskQueueStopped = true;
        await systemRepository.spaces.modify(space);
        await systemRepository.spaces.del(space);
    });
});
