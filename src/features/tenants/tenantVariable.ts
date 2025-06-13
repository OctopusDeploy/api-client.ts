import type { ControlType } from "../forms/controlType";
import type { PropertyValue } from "../variables/propertyValue";
import { SpaceScopedResource } from "../../spaceScopedResource";
import { NamedResource } from "../../namedResource";

export interface TenantVariableTemplateDisplaySettings {
    "Octopus.SelectOptions"?: string;
    "Octopus.ControlType"?: ControlType;
}

export interface TenantVariableTemplate extends SpaceScopedResource, NamedResource {
    Label: string;
    HelpText: string;
    DefaultValue?: PropertyValue;
    DisplaySettings: TenantVariableTemplateDisplaySettings;
    AllowClear?: boolean;
}

export interface TenantVariable extends SpaceScopedResource {
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

export interface TenantVariableTemplateV2 extends NamedResource {
    Id: string;
    Label: string;
    HelpText: string;
    DefaultValue?: PropertyValue;
    DisplaySettings: TenantVariableTemplateDisplaySettings;
}

export interface TenantVariableScope {
    EnvironmentIds: string[];
}

export interface TenantCommonVariableV2 {
    Id: string;
    LibraryVariableSetId: string;
    LibraryVariableSetName?: string;
    TemplateId: string;
    Template?: TenantVariableTemplateV2
    Value: PropertyValue;
    Scope: TenantVariableScope;
}

export interface MissingTenantCommonVariable {
    LibraryVariableSetId: string;
    LibraryVariableSetName?: string;
    TemplateId: string;
    Template?: TenantVariableTemplateV2,
    Value: PropertyValue;
    Scope: TenantVariableScope;
    
}

export interface TenantProjectVariableV2 {
    Id: string;
    ProjectId: string;
    ProjectName: string;
    TemplateId: string;
    Template: TenantVariableTemplateV2
    Value: PropertyValue;
    Scope: TenantVariableScope;
}

export interface MissingTenantProjectVariable {
    ProjectId: string;
    ProjectName: string;
    TemplateId: string;
    Template: TenantVariableTemplateV2
    Value: PropertyValue;
    Scope: TenantVariableScope;
    
}

export interface GetCommonVariablesByTenantIdResponse {
    TenantId: string;
    Variables: TenantCommonVariableV2[];
    MissingVariables?: MissingTenantCommonVariable[];
}

export interface GetProjectVariablesByTenantIdResponse {
    TenantId: string;
    Variables:  TenantProjectVariableV2[];
    MissingVariables?: MissingTenantProjectVariable[];
}

export interface ModifyTenantCommonVariablePayload {
    Id: string;
    TemplateId: string;
    Value: PropertyValue;
    Scope: TenantVariableScope;
}

export interface ModifyTenantProjectVariablePayload {
    Id: string;
    TemplateId: string;
    Value: PropertyValue;
    Scope: TenantVariableScope;
}

export interface ModifyCommonVariablesByTenantIdResponse {
    TenantId: string;
    Variables: TenantCommonVariableV2[];
}

export interface ModifyProjectVariablesByTenantIdResponse {
    TenantId: string;
    Variables: TenantProjectVariableV2[];
}