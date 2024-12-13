import { CreateExecutionBaseV1 } from "../../createExecutionBaseV1";

export interface RunGitRunbookCommand extends CreateExecutionBaseV1 {
    RunbookName: string;
    Notes?: string;
    EnvironmentNames: string[];
    Tenants?: string[];
    TenantTags?: string[];
}

export interface PromptedVariableValues {
    [name: string]: string;
}
