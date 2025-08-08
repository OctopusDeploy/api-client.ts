export interface BeginResourceEventsSessionCommand {
    ProjectId: string;
    EnvironmentId: string;
    MachineId: string;
    DesiredOrKubernetesMonitoredResourceId: string;
    ShowPreviousContainer: boolean;
};

export interface BeginResourceEventsSessionResponse {
    SessionId: string;
}