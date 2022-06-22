export interface DeploymentOptions {
    cancelOnTimeout: boolean;
    deployAt?: Date | undefined;
    deployTo: string[];
    deploymentCheckSleepCycle: number;
    deploymentTimeout: number;
    excludeMachines: string[];
    force: boolean;
    forcePackageDownload: boolean;
    guidedFailure?: string | undefined;
    noDeployAfter?: Date | undefined;
    noRawLog: boolean;
    progress: boolean;
    rawLogFile?: string | undefined;
    skipStepNames: string[];
    specificMachines: string[];
    tenants: string[];
    tenantTags: string[];
    variable: Variable[];
    waitForDeployment: boolean;
}

export interface Variable {
    name: string;
    value: string | number | boolean;
}
