export interface GetResourceRequest {
    ProjectId: string;
    EnvironmentId: string;
    MachineId: string;
    DesiredOrKubernetesMonitoredResourceId: string;
    TenantId?: string;
}

export interface GetResourceResponse {
    Resource: KubernetesLiveStatusDetailedResource;
}

export interface GetResourceManifestRequest {
    ProjectId: string;
    EnvironmentId: string;
    MachineId: string;
    DesiredOrKubernetesMonitoredResourceId: string;
    TenantId?: string;
}

export interface GetResourceManifestResponse {
    LiveManifest: string;
    DesiredManifest?: string;
    Diff?: LiveResourceDiff;
}

export interface LiveResourceDiff {
    Left: string;
    Right: string;
    Diff: string;
}

export interface KubernetesLiveStatusDetailedResource {
    Name: string;
    Namespace?: string;
    Kind: string;
    HealthStatus: string;
    SyncStatus?: string;
    MachineId: string;
    LastUpdated: Date;
    ManifestSummary?: ManifestSummaryResource;
    Children: KubernetesLiveStatusDetailedResource[];
    DesiredResourceId?: string;
    ResourceId?: string;
}

export interface ManifestSummaryResource {
    Labels: { [key: string]: string };
    Annotations: { [key: string]: string };
    CreationTimestamp: Date;
}

export interface PodManifestSummaryResource extends ManifestSummaryResource {
    Containers: string[];
}
