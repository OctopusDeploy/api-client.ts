import { SpaceScopedResourceV2, NewSpaceScopedResourceV2 } from "../spaceScopedResourceV2";

export interface Execution extends SpaceScopedResourceV2 {
    name: string;
    comments: string;
    created: string;
    environmentId: string;
    excludedMachineIds: string[];
    forcePackageDownload: boolean;
    formValues: any;
    manifestVariableSetId: string;
    projectId: string;
    queueTime?: Date;
    queueTimeExpiry?: Date;
    skipActions: string[];
    specificMachineIds: string[];
    taskId: string;
    tenantId?: string;
    useGuidedFailure: boolean;
}

export interface NewExecution extends NewSpaceScopedResourceV2 {
    projectId: string;
    environmentId: string;
    excludedMachineIds: string[];
    forcePackageDownload: boolean;
    formValues: any;
    comments: string;
    queueTime?: Date;
    queueTimeExpiry?: Date;
    skipActions: string[];
    specificMachineIds: string[];
    tenantId?: string;
    useGuidedFailure: boolean;
}
