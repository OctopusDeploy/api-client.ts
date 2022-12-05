import { SpaceScopedResource, ExtensionSettingsValues, NamedResource, NewNamedResource, NewSpaceScopedResource } from "../..";

export interface DeploymentEnvironment extends SpaceScopedResource, NamedResource {
    Description?: string;
    AllowDynamicInfrastructure: boolean;
    ExtensionSettings: ExtensionSettingsValues[];
    SortOrder: number;
    UseGuidedFailure: boolean;
}

export interface NewDeploymentEnvironment extends NewSpaceScopedResource, NewNamedResource {
    Description?: string;
    UseGuidedFailure?: boolean;
    AllowDynamicInfrastructure?: boolean;
    SortOrder?: number;
    ExtensionSettings?: ExtensionSettingsValues[];
}
