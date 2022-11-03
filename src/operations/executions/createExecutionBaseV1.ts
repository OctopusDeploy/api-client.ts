export interface CreateExecutionBaseV1 {
    projectName: string;
    forcePackageDownload?: boolean;
    specificMachineNames?: string[];
    excludedMachineNames?: string[];
    skipStepNames?: string[];
    useGuidedFailure?: boolean;
    runAt?: Date | undefined;
    noRunAfter?: Date | undefined;
    variables?: Map<string, string>;
}
