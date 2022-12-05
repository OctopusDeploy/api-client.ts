import { typeSafeHasOwnProperty } from "../../../utils";
import { Permission } from "../../permission";
import type { IProcess } from "../deploymentProcesses";

export interface RunbookProcess extends IProcess {
    RunbookId: string;
}

export function isRunbookProcess(resource: IProcess | null | undefined): resource is NonNullable<RunbookProcess> {
    if (resource === null || resource === undefined) {
        return false;
    }

    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    const converted = resource as RunbookProcess;
    return converted.RunbookId !== undefined && typeSafeHasOwnProperty(converted, "RunbookId");
}

export function processResourcePermission(resource: IProcess): Permission {
    const isRunbook = isRunbookProcess(resource);
    return isRunbook ? Permission.RunbookEdit : Permission.ProcessEdit;
}
