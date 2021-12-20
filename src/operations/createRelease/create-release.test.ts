import { createRelease } from "./create-release";
import { Client } from "../../client";
import { OctopusSpaceRepository, Repository } from "../../repository";
import { Config, starWars, uniqueNamesGenerator } from "unique-names-generator";
import {
    CommunicationStyle,
    DeploymentTargetResource,
    EnvironmentResource,
    NewDeploymentTargetResource,
    NewTenantResource,
    ProjectResource,
    RunCondition,
    SpaceResource,
    StartTrigger,
    TenantedDeploymentMode,
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
    let machine: DeploymentTargetResource;
    const randomConfig: Config = { dictionaries: [starWars] };

    jest.setTimeout(100000);

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

        const spaceName = uniqueNamesGenerator(randomConfig);
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
        const projectName = uniqueNamesGenerator(randomConfig);
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
            },
        ];
        console.log("Updating process");
        await repository.deploymentProcesses.saveToProject(project, dp);

        console.log("Creating environment");
        environment = await repository.environments.create({ Name: uniqueNamesGenerator(randomConfig) });

        console.log("Creating machine");

        machine = await repository.machines.create({
            Endpoint: {
                CommunicationStyle: CommunicationStyle.None,
            },
            EnvironmentIds: [environment.Id],
            Name: uniqueNamesGenerator(randomConfig),
            Roles: ["deploy"],
            TenantedDeploymentParticipation: TenantedDeploymentMode.TenantedOrUntenanted,
        } as NewDeploymentTargetResource);
    });

    test("create a release and deploy to single environment", async () => {
        await createRelease(configuration, serverEndpoint, space.Id, project.Name, undefined, { deployTo: [environment.Name], waitForDeployment: true });
    });

    test("create a release and deploy to multiple environments", async () => {
        console.log("Creating environment");
        const environment2 = await repository.environments.create({ Name: uniqueNamesGenerator(randomConfig) });

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

        await createRelease(configuration, serverEndpoint, space.Id, project.Name, undefined, {
            deployTo: [environment.Name, environment2.Name],
            waitForDeployment: true,
        });
    });

    test("create a release and deploy to multiple tenants", async () => {
        project.TenantedDeploymentMode = TenantedDeploymentMode.Tenanted;
        await repository.projects.modify(project);

        let newTenantResource: NewTenantResource = { ProjectEnvironments: {}, TenantTags: [], Name: uniqueNamesGenerator(randomConfig) };
        newTenantResource.ProjectEnvironments[project.Id] = [environment.Id];
        const tenant1 = await repository.tenants.create(newTenantResource);

        newTenantResource = { ProjectEnvironments: {}, TenantTags: [], Name: uniqueNamesGenerator(randomConfig) };
        newTenantResource.ProjectEnvironments[project.Id] = [environment.Id];
        const tenant2 = await repository.tenants.create(newTenantResource);

        machine.TenantIds = [tenant1.Id, tenant2.Id];
        await repository.machines.modify(machine);

        await createRelease(configuration, serverEndpoint, space.Id, project.Name, undefined, {
            tenants: [tenant1.Id, tenant2.Id],
            deployTo: [environment.Name],
            waitForDeployment: true,
        });
    });

    test("create a release and deploy to multiple tenants via tag", async () => {
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
            Name: uniqueNamesGenerator(randomConfig),
        };
        newTenantResource.ProjectEnvironments[project.Id] = [environment.Id];
        const tenant1 = await repository.tenants.create(newTenantResource);

        newTenantResource = { ProjectEnvironments: {}, TenantTags: [tagSet.Tags[0].CanonicalTagName], Name: uniqueNamesGenerator(randomConfig) };
        newTenantResource.ProjectEnvironments[project.Id] = [environment.Id];
        const tenant2 = await repository.tenants.create(newTenantResource);

        machine.TenantIds = [tenant1.Id, tenant2.Id];
        await repository.machines.modify(machine);

        await createRelease(configuration, serverEndpoint, space.Id, project.Name, undefined, {
            tenantTags: [tagSet.Tags[0].CanonicalTagName],
            deployTo: [environment.Name],
            waitForDeployment: true,
        });
    });

    afterEach(async () => {
        space.TaskQueueStopped = true;
        await systemRepository.spaces.modify(space);
        await systemRepository.spaces.del(space);
    });
});
