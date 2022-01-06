import { AuthenticationRepository } from "./repositories/authenticationRepository";
import type { Client } from "./client";
import { AccountRepository } from "./repositories/accountRepository";
import { ActionTemplateRepository } from "./repositories/actionTemplateRepository";
import { ArtifactRepository } from "./repositories/artifactRepository";
import { BuildInformationRepository } from "./repositories/buildInformationRepository";
import { CertificateConfigurationRepository } from "./repositories/certificateConfigurationRepository";
import { CertificateRepository } from "./repositories/certificateRepository";
import { ChannelRepository } from "./repositories/channelRepository";
import { CloudTemplateRepository } from "./repositories/cloudTemplateRepository";
import { CommunityActionTemplateRepository } from "./repositories/communityActionTemplateRepository";
import { DashboardRepository } from "./repositories/dashboardRepository";
import { DashboardConfigurationRepository } from "./repositories/dashboardConfigurationRepository";
import { DefectRepository } from "./repositories/defectRepository";
import { DeploymentRepository } from "./repositories/deploymentRepository";
import { DynamicExtensionRepository } from "./repositories/dynamicExtensionRepository";
import { EnvironmentRepository } from "./repositories/environmentRepository";
import { EventRepository } from "./repositories/eventRepository";
import { ExternalSecurityGroupProviderRepository } from "./repositories/externalSecurityGroupProviderRepository";
import { ExternalSecurityGroupRepository } from "./repositories/externalSecurityGroupRepository";
import { ExternalUsersRepository } from "./repositories/externalUsersRepository";
import { FeaturesConfigurationRepository } from "./repositories/featuresConfigurationRepository";
import { FeedRepository } from "./repositories/feedRepository";
import { ImportExportActions } from "./repositories/importExportActions";
import { InterruptionRepository } from "./repositories/interruptionRepository";
import { InvitationRepository } from "./repositories/inviteRepository";
import { LetsEncryptConfigurationRepository } from "./repositories/letsEncryptConfigurationRepository";
import { LibraryVariableRepository } from "./repositories/libraryVariableRepository";
import { LicenseRepository } from "./repositories/licenseRepository";
import { LifecycleRepository } from "./repositories/lifecycleRepository";
import { MachinePolicyRepository } from "./repositories/machinePolicyRepository";
import { MachineRepository } from "./repositories/machineRepository";
import { MachineRoleRepository } from "./repositories/machineRoleRepository";
import { MachineShellsRepository } from "./repositories/machineShellsRepository";
import { MaintenanceConfigurationRepository } from "./repositories/maintenanceConfigurationRepository";
import { OctopusServerNodeRepository } from "./repositories/octopusServerNodeRepository";
import { RetentionDefaultConfigurationRepository } from "./repositories/retentionDefaultConfigurationRepository";
import type { RouteArgs } from "./resolver";
import { RunbookProcessRepository } from "./repositories/runbookProcessRepository";
import { RunbookRepository } from "./repositories/runbookRepository";
import { RunbookRunRepository } from "./repositories/runbookRunRepository";
import { RunbookSnapshotRepository } from "./repositories/runbookSnapshotRepository";
import { PackageRepository } from "./repositories/packageRepository";
import { PerformanceConfigurationRepository } from "./repositories/performanceConfigurationRepository";
import { PermissionDescriptionRepository } from "./repositories/permissionDescriptionRepository";
import { ProgressionRepository } from "./repositories/progressionRepository";
import { ProjectGroupRepository } from "./repositories/projectGroupRepository";
import ProjectRepository from "./repositories/projectRepository";
import { ProjectTriggerRepository } from "./repositories/projectTriggerRepository";
import { ProxyRepository } from "./repositories/proxyRepository";
import { ReleasesRepository } from "./repositories/releasesRepository";
import { SchedulerRepository } from "./repositories/schedulerRepository";
import { ScopedUserRoleRepository } from "./repositories/scopedUserRoleRepository";
import { ServerConfigurationRepository } from "./repositories/serverConfigurationRepository";
import { ServerStatusRepository } from "./repositories/serverStatusRepository";
import SettingsRepository from "./repositories/settingsRepository";
import { SmtpConfigurationRepository } from "./repositories/smtpConfigurationRepository";
import SubscriptionRepository from "./repositories/subscriptionRepository";
import { SpaceRepository } from "./repositories/spaceRepository";
import TagSetRepository from "./repositories/tagSetRepository";
import { TaskRepository } from "./repositories/taskRepository";
import TeamMembershipRepository from "./repositories/teamMembershipRepository";
import { TeamRepository } from "./repositories/teamRepository";
import TenantRepository from "./repositories/tenantRepository";
import TenantVariableRepository from "./repositories/tenantVariableRepository";
import { UpgradeConfigurationRepository } from "./repositories/upgradeConfigurationRepository";
import { UserIdentityMetadataRepository } from "./repositories/userIdentityMetadataRepository";
import { UserOnBoardingRepository } from "./repositories/userOnBoardingRepository";
import { UserPermissionRepository } from "./repositories/userPermissionRepository";
import UserRepository from "./repositories/userRepository";
import UserRoleRepository from "./repositories/userRoleRepository";
import VariableRepository from "./repositories/variableRepository";
import { WorkerPoolsRepository } from "./repositories/workerPoolsRepository";
import { WorkerRepository } from "./repositories/workerRepository";
import { WorkerShellsRepository } from "./repositories/workerShellsRepository";
import { DeploymentProcessRepository } from ".";

interface ServerInformation {
    version: string;
}

export interface OctopusCommonRepository {
    events: EventRepository;
    tasks: TaskRepository;
    teams: TeamRepository;
    scopedUserRoles: ScopedUserRoleRepository;
    userPermissions: UserPermissionRepository;
    teamMembership: TeamMembershipRepository;
    invitations: InvitationRepository;
    spaceId: string | null;
    client: Client;
}

export interface OctopusSystemRepository extends OctopusCommonRepository {
    authentication: AuthenticationRepository;
    communityActionTemplates: CommunityActionTemplateRepository;
    featuresConfiguration: FeaturesConfigurationRepository;
    letsEncryptConfiguration: LetsEncryptConfigurationRepository;
    maintenanceConfiguration: MaintenanceConfigurationRepository;
    octopusServerNodes: OctopusServerNodeRepository;
    performanceConfiguration: PerformanceConfigurationRepository;
    permissionDescriptions: PermissionDescriptionRepository;
    scheduler: SchedulerRepository;
    serverConfiguration: ServerConfigurationRepository;
    serverStatus: ServerStatusRepository;
    settings: SettingsRepository;
    smtpConfiguration: SmtpConfigurationRepository;
    spaces: SpaceRepository;
    users: UserRepository;
    userRoles: UserRoleRepository;
    cloudTemplates: CloudTemplateRepository;
    externalSecurityGroupProviders: ExternalSecurityGroupProviderRepository;
    externalSecurityGroups: ExternalSecurityGroupRepository;
    externalUsers: ExternalUsersRepository;
    licenses: LicenseRepository;
    upgradeConfiguration: UpgradeConfigurationRepository;
    userIdentityMetadata: UserIdentityMetadataRepository;
    getServerInformation: () => ServerInformation;
}

export interface OctopusSpaceRepository extends OctopusCommonRepository {
    accounts: AccountRepository;
    actionTemplates: ActionTemplateRepository;
    artifacts: ArtifactRepository;
    buildInformation: BuildInformationRepository;
    certificateConfiguration: CertificateConfigurationRepository;
    certificates: CertificateRepository;
    channels: ChannelRepository;
    dashboardConfiguration: DashboardConfigurationRepository;
    dashboards: DashboardRepository;
    defects: DefectRepository;
    deploymentProcesses: DeploymentProcessRepository;
    deployments: DeploymentRepository;
    environments: EnvironmentRepository;
    feeds: FeedRepository;
    importExport: ImportExportActions;
    interruptions: InterruptionRepository;
    libraryVariableSets: LibraryVariableRepository;
    lifecycles: LifecycleRepository;
    machinePolicies: MachinePolicyRepository;
    machineRoles: MachineRoleRepository;
    machineShells: MachineShellsRepository;
    machines: MachineRepository;
    runbooks: RunbookRepository;
    runbookProcess: RunbookProcessRepository;
    runbookSnapshots: RunbookSnapshotRepository;
    runbookRuns: RunbookRunRepository;
    packages: PackageRepository;
    progression: ProgressionRepository;
    projectGroups: ProjectGroupRepository;
    projects: ProjectRepository;
    projectTriggers: ProjectTriggerRepository;
    proxies: ProxyRepository;
    releases: ReleasesRepository;
    subscriptions: SubscriptionRepository;
    tagSets: TagSetRepository;
    tenants: TenantRepository;
    tenantVariables: TenantVariableRepository;
    userOnboarding: UserOnBoardingRepository;
    variables: VariableRepository;
    workerPools: WorkerPoolsRepository;
    workerShells: WorkerShellsRepository;
    workers: WorkerRepository;
}

// Repositories provide a helpful abstraction around the Octopus Deploy API
export class Repository implements OctopusSpaceRepository, OctopusSystemRepository {
    readonly takeAll = 2147483647;
    readonly takeDefaultPageSize = 30; // Only used when we don't rely on the default that's applied server-side.
    accounts: AccountRepository;
    actionTemplates: ActionTemplateRepository;
    artifacts: ArtifactRepository;
    authentication: AuthenticationRepository;
    buildInformation: BuildInformationRepository;
    certificateConfiguration: CertificateConfigurationRepository;
    certificates: CertificateRepository;
    channels: ChannelRepository;
    cloudTemplates: CloudTemplateRepository;
    communityActionTemplates: CommunityActionTemplateRepository;
    dashboardConfiguration: DashboardConfigurationRepository;
    dashboards: DashboardRepository;
    defects: DefectRepository;
    deploymentProcesses: DeploymentProcessRepository;
    deployments: DeploymentRepository;
    dynamicExtensions: DynamicExtensionRepository;
    environments: EnvironmentRepository;
    events: EventRepository;
    externalSecurityGroupProviders: ExternalSecurityGroupProviderRepository;
    externalSecurityGroups: ExternalSecurityGroupRepository;
    externalUsers: ExternalUsersRepository;
    featuresConfiguration: FeaturesConfigurationRepository;
    feeds: FeedRepository;
    importExport: ImportExportActions;
    interruptions: InterruptionRepository;
    invitations: InvitationRepository;
    letsEncryptConfiguration: LetsEncryptConfigurationRepository;
    libraryVariableSets: LibraryVariableRepository;
    licenses: LicenseRepository;
    lifecycles: LifecycleRepository;
    machinePolicies: MachinePolicyRepository;
    machineRoles: MachineRoleRepository;
    machineShells: MachineShellsRepository;
    machines: MachineRepository;
    maintenanceConfiguration: MaintenanceConfigurationRepository;
    octopusServerNodes: OctopusServerNodeRepository;
    retentionDefaultConfiguration: RetentionDefaultConfigurationRepository;
    runbooks: RunbookRepository;
    runbookProcess: RunbookProcessRepository;
    runbookSnapshots: RunbookSnapshotRepository;
    runbookRuns: RunbookRunRepository;
    packages: PackageRepository;
    performanceConfiguration: PerformanceConfigurationRepository;
    permissionDescriptions: PermissionDescriptionRepository;
    progression: ProgressionRepository;
    projectGroups: ProjectGroupRepository;
    projects: ProjectRepository;
    projectTriggers: ProjectTriggerRepository;
    proxies: ProxyRepository;
    releases: ReleasesRepository;
    scopedUserRoles: ScopedUserRoleRepository;
    scheduler: SchedulerRepository;
    serverStatus: ServerStatusRepository;
    serverConfiguration: ServerConfigurationRepository;
    settings: SettingsRepository;
    smtpConfiguration: SmtpConfigurationRepository;
    spaces: SpaceRepository;
    subscriptions: SubscriptionRepository;
    tagSets: TagSetRepository;
    tasks: TaskRepository;
    teams: TeamRepository;
    tenants: TenantRepository;
    tenantVariables: TenantVariableRepository;
    upgradeConfiguration: UpgradeConfigurationRepository;
    userIdentityMetadata: UserIdentityMetadataRepository;
    userOnboarding: UserOnBoardingRepository;
    userRoles: UserRoleRepository;
    userPermissions: UserPermissionRepository;
    teamMembership: TeamMembershipRepository;
    users: UserRepository;
    variables: VariableRepository;
    getServerInformation: () => ServerInformation;
    workerPools: WorkerPoolsRepository;
    workerShells: WorkerShellsRepository;
    workers: WorkerRepository;

    constructor(public readonly client: Client) {
        this.accounts = new AccountRepository(client);
        this.actionTemplates = new ActionTemplateRepository(client);
        this.artifacts = new ArtifactRepository(client);
        this.authentication = new AuthenticationRepository(client);
        this.buildInformation = new BuildInformationRepository(client);
        this.certificateConfiguration = new CertificateConfigurationRepository(client);
        this.certificates = new CertificateRepository(client);
        this.cloudTemplates = new CloudTemplateRepository(client);
        this.communityActionTemplates = new CommunityActionTemplateRepository(client);
        this.dashboardConfiguration = new DashboardConfigurationRepository(client);
        this.dashboards = new DashboardRepository(client);
        this.defects = new DefectRepository(client);
        this.deployments = new DeploymentRepository(client);
        this.dynamicExtensions = new DynamicExtensionRepository(client);
        this.environments = new EnvironmentRepository(client);
        this.events = new EventRepository(client);
        this.externalSecurityGroupProviders = new ExternalSecurityGroupProviderRepository(client);
        this.externalSecurityGroups = new ExternalSecurityGroupRepository(client);
        this.externalUsers = new ExternalUsersRepository(client);
        this.featuresConfiguration = new FeaturesConfigurationRepository(client);
        this.feeds = new FeedRepository(client);
        this.importExport = new ImportExportActions(client);
        this.interruptions = new InterruptionRepository(client);
        this.invitations = new InvitationRepository(client);
        this.letsEncryptConfiguration = new LetsEncryptConfigurationRepository(client);
        this.libraryVariableSets = new LibraryVariableRepository(client);
        this.licenses = new LicenseRepository(client);
        this.lifecycles = new LifecycleRepository(client);
        this.machinePolicies = new MachinePolicyRepository(client);
        this.machineRoles = new MachineRoleRepository(client);
        this.machineShells = new MachineShellsRepository(client);
        this.machines = new MachineRepository(client);
        this.maintenanceConfiguration = new MaintenanceConfigurationRepository(client);
        this.octopusServerNodes = new OctopusServerNodeRepository(client);
        this.retentionDefaultConfiguration = new RetentionDefaultConfigurationRepository(client);
        this.runbooks = new RunbookRepository(client);
        this.runbookProcess = new RunbookProcessRepository(client);
        this.runbookSnapshots = new RunbookSnapshotRepository(client);
        this.runbookRuns = new RunbookRunRepository(client);
        this.packages = new PackageRepository(client);
        this.performanceConfiguration = new PerformanceConfigurationRepository(client);
        this.permissionDescriptions = new PermissionDescriptionRepository(client);
        this.progression = new ProgressionRepository(client);
        this.projectGroups = new ProjectGroupRepository(client);
        this.projects = new ProjectRepository(client);
        this.channels = new ChannelRepository(this.projects, client);
        this.deploymentProcesses = new DeploymentProcessRepository(this.projects, client);
        this.projectTriggers = new ProjectTriggerRepository(client);
        this.proxies = new ProxyRepository(client);
        this.releases = new ReleasesRepository(client);
        this.scheduler = new SchedulerRepository(client);
        this.scopedUserRoles = new ScopedUserRoleRepository(client);
        this.serverStatus = new ServerStatusRepository(client);
        this.serverConfiguration = new ServerConfigurationRepository(client);
        this.settings = new SettingsRepository(client);
        this.smtpConfiguration = new SmtpConfigurationRepository(client);
        this.spaces = new SpaceRepository(client);
        this.subscriptions = new SubscriptionRepository(client);
        this.tagSets = new TagSetRepository(client);
        this.tasks = new TaskRepository(client);
        this.teams = new TeamRepository(client);
        this.tenants = new TenantRepository(client);
        this.tenantVariables = new TenantVariableRepository(client);
        this.upgradeConfiguration = new UpgradeConfigurationRepository(client);
        this.userIdentityMetadata = new UserIdentityMetadataRepository(client);
        this.userOnboarding = new UserOnBoardingRepository(client);
        this.userPermissions = new UserPermissionRepository(client);
        this.teamMembership = new TeamMembershipRepository(client);
        this.userRoles = new UserRoleRepository(client);
        this.users = new UserRepository(client);
        this.variables = new VariableRepository(client);
        this.getServerInformation = client.getServerInformation.bind(client);
        this.workerPools = new WorkerPoolsRepository(client);
        this.workerShells = new WorkerShellsRepository(client);
        this.workers = new WorkerRepository(client);
    }

    public resolve = (path: string, uriTemplateParameters?: RouteArgs) => this.client.resolve(path, uriTemplateParameters);
    public get spaceId(): string | null {
        return this.client.spaceId;
    }

    async forSpace(spaceId: string): Promise<OctopusSpaceRepository> {
        if (this.spaceId !== spaceId) {
            return new Repository(await this.client.forSpace(spaceId));
        }

        return this;
    }

    forSystem(): OctopusSystemRepository {
        return new Repository(this.client.forSystem());
    }

    switchToSpace(spaceId: string): Promise<void> {
        return this.client.switchToSpace(spaceId);
    }

    switchToSystem(): void {
        this.client.switchToSystem();
    }
}