export interface BeginContainerLogsSessionCommand {
    ProjectId: string;
    EnvironmentId: string;
    MachineId: string;
    PodName: string;
    ContainerName: string;
    DesiredOrKubernetesMonitoredResourceId: string;
    ShowPreviousContainer: boolean;
}

export interface BeginContainerLogsSessionResponse {
    SessionId: string;
}
