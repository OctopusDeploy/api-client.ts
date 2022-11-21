import type { ControlType } from "../forms/controlType";
import type { PropertyValue } from "../variables/propertyValue";
import { ResourceV2 } from "../resourceV2";

export interface TenantVariableTemplateDisplaySettings {
    "Octopus.SelectOptions"?: string;
    "Octopus.ControlType"?: ControlType;
}

export interface TenantVariableTemplate extends ResourceV2 {
    Name: string;
    Label: string;
    HelpText: string;
    DefaultValue?: PropertyValue;
    DisplaySettings: TenantVariableTemplateDisplaySettings;
    AllowClear?: boolean;
}

export interface TenantVariable extends ResourceV2 {
    TenantId: string;
    TenantName: string;
    LibraryVariables: { [libraryVariableSetId: string]: TenantLibraryVariable };
    ProjectVariables: { [projectId: string]: TenantProjectVariable };
}

export interface TenantLibraryVariable {
    LibraryVariableSetId: string;
    LibraryVariableSetName: string;
    Templates: TenantVariableTemplate[];
    Variables: { [variableId: string]: PropertyValue };
}

export interface TenantProjectVariable {
    ProjectId: string;
    ProjectName: string;
    Templates: TenantVariableTemplate[];
    Variables: {
        [environmentId: string]: { [variableId: string]: PropertyValue };
    };
}
