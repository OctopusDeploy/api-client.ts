export interface GetLiveStatusRequest {
    ProjectId: string;
    EnvironmentId: string;
    TenantId?: string;
    SummaryOnly?: boolean;
}

export interface GetLiveStatusResponse {
    MachineStatuses: KubernetesMachineLiveStatusResource[];
    Summary: LiveStatusSummaryResource;
}

export interface KubernetesMachineLiveStatusResource {
    MachineId: string;
    Status: string;
    Resources: KubernetesLiveStatusResource[];
}

export interface LiveStatusSummaryResource {
    Status: string;
    LastUpdated: Date;
}

export interface KubernetesLiveStatusResource {
    Name: string;
    Namespace?: string;
    Kind: string;
    HealthStatus: string;
    SyncStatus?: string;
    MachineId: string;
    Children: KubernetesLiveStatusResource[];
    DesiredResourceId?: string;
    ResourceId?: string;
}
