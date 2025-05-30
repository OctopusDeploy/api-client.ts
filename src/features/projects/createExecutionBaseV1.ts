import { SpaceScopedOperation } from "../..";

export interface CreateExecutionBaseV1 extends SpaceScopedOperation {
    ProjectName: string;
    ForcePackageDownload?: boolean;
    SpecificMachineNames?: string[];
    ExcludedMachineNames?: string[];
    SkipStepNames?: string[];
    UseGuidedFailure?: boolean;
    RunAt?: Date | undefined;
    NoRunAfter?: Date | undefined;
    Variables?: PromptedVariableValues;
    DeploymentFreezeOverrideReason?: string;
    DeploymentFreezeNames?: string[];
}

export interface PromptedVariableValues {
    [name: string]: string;
}
