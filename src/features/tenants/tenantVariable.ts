import type { ControlType } from "../forms/controlType";
import type { PropertyValue } from "../variables/propertyValue";
import { ResourceV2 } from "../resourceV2";

export interface TenantVariableTemplateDisplaySettings {
  "octopus.SelectOptions"?: string;
  "octopus.ControlType"?: ControlType;
}

export interface TenantVariableTemplate extends ResourceV2 {
  name: string;
  label: string;
  helpText: string;
  defaultValue?: PropertyValue;
  displaySettings: TenantVariableTemplateDisplaySettings;
  allowClear?: boolean;
}

export interface TenantVariable extends ResourceV2 {
  tenantId: string;
  tenantName: string;
  libraryVariables: { [libraryVariableSetId: string]: TenantLibraryVariable };
  projectVariables: { [projectId: string]: TenantProjectVariable };
}

export interface TenantLibraryVariable {
  libraryVariableSetId: string;
  libraryVariableSetName: string;
  templates: TenantVariableTemplate[];
  variables: { [variableId: string]: PropertyValue };
}

export interface TenantProjectVariable {
  projectId: string;
  projectName: string;
  templates: TenantVariableTemplate[];
  variables: {
    [environmentId: string]: { [variableId: string]: PropertyValue };
  };
}
