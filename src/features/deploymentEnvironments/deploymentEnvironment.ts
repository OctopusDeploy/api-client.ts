import { SpaceScopedResourceV2, ExtensionSettingsValues, NamedResourceV2, NewNamedResourceV2, NewSpaceScopedResourceV2 } from "..";

export interface DeploymentEnvironment extends NamedResourceV2, SpaceScopedResourceV2 {
    Description?: string;
    AllowDynamicInfrastructure: boolean;
    ExtensionSettings: ExtensionSettingsValues[];
    SortOrder: number;
    UseGuidedFailure: boolean;
}

export interface NewDeploymentEnvironment extends NewNamedResourceV2, NewSpaceScopedResourceV2 {
    Description?: string;
    UseGuidedFailure?: boolean;
    AllowDynamicInfrastructure?: boolean;
    SortOrder?: number;
    ExtensionSettings?: ExtensionSettingsValues[];
}
