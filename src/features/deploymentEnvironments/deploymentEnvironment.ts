import { SpaceScopedResourceV2, ExtensionSettingsValues, NamedResourceV2, NewNamedResourceV2, NewSpaceScopedResourceV2 } from "..";

export interface DeploymentEnvironment extends NamedResourceV2, SpaceScopedResourceV2 {
    description?: string;
    allowDynamicInfrastructure: boolean;
    extensionSettings: ExtensionSettingsValues[];
    sortOrder: number;
    useGuidedFailure: boolean;
}

export interface NewDeploymentEnvironment extends NewNamedResourceV2, NewSpaceScopedResourceV2 {
    description?: string;
    useGuidedFailure?: boolean;
    allowDynamicInfrastructure?: boolean;
    sortOrder?: number;
    extensionSettings?: ExtensionSettingsValues[];
}