import {Moment} from "moment";

export interface DeploymentOptions {
    cancelOnTimeout: boolean;
    deployAt?: Moment | undefined;
    deployTo: string[];
    deploymentCheckSleepCycle: number;
    deploymentTimeout: number;
    excludeMachines: string[];
    force: boolean;
    forcePackageDownload: boolean;
    guidedFailure?: string | undefined;
    noDeployAfter?: Moment | undefined;
    noRawLog: boolean;
    progress: boolean;
    rawLogFile?: string | undefined;
    skip: string[];
    specificMachines: string[];
    tenants: string[];
    tenantTags: string[];
    variable: string[];
    waitForDeployment: boolean;
}