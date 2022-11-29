//Enums can't be keys in a dictionary so we might need to convert this to a list of static strings
export enum Permission {
    None = "None",

    AccountCreate = "AccountCreate",
    AccountDelete = "AccountDelete",
    AccountEdit = "AccountEdit",
    AccountView = "AccountView",

    ActionTemplateCreate = "ActionTemplateCreate",
    ActionTemplateDelete = "ActionTemplateDelete",
    ActionTemplateEdit = "ActionTemplateEdit",
    ActionTemplateView = "ActionTemplateView",

    AdministerSystem = "AdministerSystem",

    ArtifactCreate = "ArtifactCreate",
    ArtifactDelete = "ArtifactDelete",
    ArtifactEdit = "ArtifactEdit",
    ArtifactView = "ArtifactView",

    BuildInformationAdminister = "BuildInformationAdminister",
    BuildInformationPush = "BuildInformationPush",

    BuiltInFeedAdminister = "BuiltInFeedAdminister",
    BuiltInFeedDownload = "BuiltInFeedDownload",
    BuiltInFeedPush = "BuiltInFeedPush",

    CertificateCreate = "CertificateCreate",
    CertificateDelete = "CertificateDelete",
    CertificateEdit = "CertificateEdit",
    CertificateView = "CertificateView",

    CertificateExportPrivateKey = "CertificateExportPrivateKey",

    ConfigureServer = "ConfigureServer",

    DefectReport = "DefectReport",
    DefectResolve = "DefectResolve",

    DeploymentCreate = "DeploymentCreate",
    DeploymentDelete = "DeploymentDelete",
    DeploymentView = "DeploymentView",

    EnvironmentCreate = "EnvironmentCreate",
    EnvironmentDelete = "EnvironmentDelete",
    EnvironmentEdit = "EnvironmentEdit",
    EnvironmentView = "EnvironmentView",

    EventView = "EventView",

    FeedEdit = "FeedEdit",
    FeedView = "FeedView",

    InterruptionSubmit = "InterruptionSubmit",

    InterruptionView = "InterruptionView",
    InterruptionViewSubmitResponsible = "InterruptionViewSubmitResponsible",

    LibraryVariableSetCreate = "LibraryVariableSetCreate",
    LibraryVariableSetDelete = "LibraryVariableSetDelete",
    LibraryVariableSetEdit = "LibraryVariableSetEdit",
    LibraryVariableSetView = "LibraryVariableSetView",

    LifecycleCreate = "LifecycleCreate",
    LifecycleDelete = "LifecycleDelete",
    LifecycleEdit = "LifecycleEdit",
    LifecycleView = "LifecycleView",

    ReleaseCreate = "ReleaseCreate",
    ReleaseView = "ReleaseView",
    ReleaseEdit = "ReleaseEdit",
    ReleaseDelete = "ReleaseDelete",

    MachineCreate = "MachineCreate",
    MachineEdit = "MachineEdit",
    MachineView = "MachineView",
    MachineDelete = "MachineDelete",

    MachinePolicyCreate = "MachinePolicyCreate",
    MachinePolicyDelete = "MachinePolicyDelete",
    MachinePolicyEdit = "MachinePolicyEdit",
    MachinePolicyView = "MachinePolicyView",

    ProjectGroupCreate = "ProjectGroupCreate",
    ProjectGroupDelete = "ProjectGroupDelete",
    ProjectGroupEdit = "ProjectGroupEdit",
    ProjectGroupView = "ProjectGroupView",

    TenantCreate = "TenantCreate",
    TenantDelete = "TenantDelete",
    TenantEdit = "TenantEdit",
    TenantView = "TenantView",

    TagSetCreate = "TagSetCreate",
    TagSetDelete = "TagSetDelete",
    TagSetEdit = "TagSetEdit",

    ProcessEdit = "ProcessEdit",
    ProcessView = "ProcessView",

    ProjectCreate = "ProjectCreate",
    ProjectDelete = "ProjectDelete",
    ProjectEdit = "ProjectEdit",
    ProjectView = "ProjectView",

    ProxyCreate = "ProxyCreate",
    ProxyDelete = "ProxyDelete",
    ProxyEdit = "ProxyEdit",
    ProxyView = "ProxyView",

    RunbookEdit = "RunbookEdit",
    RunbookView = "RunbookView",

    RunbookRunCreate = "RunbookRunCreate",
    RunbookRunEdit = "RunbookRunEdit",
    RunbookRunView = "RunbookRunView",

    SpaceCreate = "SpaceCreate",
    SpaceDelete = "SpaceDelete",
    SpaceEdit = "SpaceEdit",
    SpaceView = "SpaceView",

    SubscriptionCreate = "SubscriptionCreate",
    SubscriptionDelete = "SubscriptionDelete",
    SubscriptionEdit = "SubscriptionEdit",
    SubscriptionView = "SubscriptionView",

    TaskCancel = "TaskCancel",
    TaskCreate = "TaskCreate",
    TaskEdit = "TaskEdit",
    TaskView = "TaskView",

    TeamCreate = "TeamCreate",
    TeamDelete = "TeamDelete",
    TeamEdit = "TeamEdit",
    TeamView = "TeamView",

    TriggerCreate = "TriggerCreate",
    TriggerDelete = "TriggerDelete",
    TriggerEdit = "TriggerEdit",
    TriggerView = "TriggerView",

    UserEdit = "UserEdit",
    UserInvite = "UserInvite",
    UserView = "UserView",

    UserRoleEdit = "UserRoleEdit",
    UserRoleView = "UserRoleView",

    VariableEdit = "VariableEdit",
    VariableEditUnscoped = "VariableEditUnscoped",

    VariableView = "VariableView",
    VariableViewUnscoped = "VariableViewUnscoped",

    WorkerEdit = "WorkerEdit",
    WorkerView = "WorkerView",
}
