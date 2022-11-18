
export interface TenantMissingVariable {
  tenantId: string;
  missingVariables: MissingVariable[];
}

export interface MissingVariable {
  projectId?: string;
  environmentId?: string;
  libraryVariableSetId?: string;
  variableTemplateName: string;
  variableTemplateId: string;
}
