import { SpaceScopedResourceV2, NewSpaceScopedResourceV2 } from "../spaceScopedResourceV2";

export interface Execution extends SpaceScopedResourceV2 {
    Name: string;
    Comments: string;
    Created: string;
    EnvironmentId: string;
    ExcludedMachineIds: string[];
    ForcePackageDownload: boolean;
    FormValues: any;
    ManifestVariableSetId: string;
    ProjectId: string;
    QueueTime?: Date;
    QueueTimeExpiry?: Date;
    SkipActions: string[];
    SpecificMachineIds: string[];
    TaskId: string;
    TenantId?: string;
    UseGuidedFailure: boolean;
}

export interface NewExecution extends NewSpaceScopedResourceV2 {
    ProjectId: string;
    EnvironmentId: string;
    ExcludedMachineIds: string[];
    ForcePackageDownload: boolean;
    FormValues: any;
    Comments: string;
    QueueTime?: Date;
    QueueTimeExpiry?: Date;
    SkipActions: string[];
    SpecificMachineIds: string[];
    TenantId?: string;
    UseGuidedFailure: boolean;
}
