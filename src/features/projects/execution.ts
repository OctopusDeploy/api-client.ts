import { SpaceScopedResource, NewSpaceScopedResource } from "../spaceScopedResource";

export interface Execution extends SpaceScopedResource {
    Name: string;
    Comments: string;
    Created: string;
    EnvironmentId: string;
    ExcludedMachineIds: string[];
    ForcePackageDownload: boolean;
    FormValues: Record<string, unknown>;
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

export interface NewExecution extends NewSpaceScopedResource {
    ProjectId: string;
    EnvironmentId: string;
    ExcludedMachineIds: string[];
    ForcePackageDownload: boolean;
    FormValues: Record<string, unknown>;
    Comments: string;
    QueueTime?: Date;
    QueueTimeExpiry?: Date;
    SkipActions: string[];
    SpecificMachineIds: string[];
    TenantId?: string;
    UseGuidedFailure: boolean;
}
