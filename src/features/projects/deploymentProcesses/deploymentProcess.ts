import { typeSafeHasOwnProperty } from "../../../utils";
import { ICanBeVersionControlled } from "../../canBeVersionControlled";
import { ICommitCommand } from "../../commitCommand";
import { SpaceScopedResource } from "../../../spaceScopedResource";
import { isRunbookProcess } from "../runbooks/runbookProcess";
import { DeploymentStep } from "./deploymentStep";

export interface IProcess extends SpaceScopedResource {
    ProjectId: string;
    Steps: DeploymentStep[];
    Version: number;
    LastSnapshotId?: string;
}
export type DeploymentProcess = IProcess & ICanBeVersionControlled;
export type ModifyDeploymentProcessCommand = DeploymentProcess & ICommitCommand;

export function isDeploymentProcess(resource: IProcess | null | undefined): resource is NonNullable<IProcess> {
    if (resource === null || resource === undefined) {
        return false;
    }

    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    const converted = resource as DeploymentProcess;
    return !isRunbookProcess(resource) && converted.Version !== undefined && typeSafeHasOwnProperty(converted, "Version");
}

export interface DeploymentProcessOclResource {
    Ocl: string;
}

export type ModifyDeploymentProcessOclCommand = DeploymentProcessOclResource & ICommitCommand;
