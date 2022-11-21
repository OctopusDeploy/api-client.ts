export interface TenantMissingVariable {
    TenantId: string;
    MissingVariables: MissingVariable[];
}

export interface MissingVariable {
    ProjectId?: string;
    EnvironmentId?: string;
    LibraryVariableSetId?: string;
    VariableTemplateName: string;
    VariableTemplateId: string;
}
