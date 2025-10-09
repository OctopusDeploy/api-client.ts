import { SpaceScopedResource, ExtensionSettingsValues, NamedResource, NewNamedResource, NewSpaceScopedResource } from "../..";

export interface DeploymentEnvironment extends SpaceScopedResource, NamedResource {
    Description?: string;
    AllowDynamicInfrastructure: boolean;
    ExtensionSettings: ExtensionSettingsValues[];
    SortOrder: number;
    UseGuidedFailure: boolean;
}

export interface DeploymentEnvironmentV2 extends SpaceScopedResource, NamedResource {
    Slug: string;
    Description?: string;
    Type: string;
    SortOrder: number;
}

export interface EphemeralDeploymentEnvironment extends DeploymentEnvironmentV2 {
    Type: "Ephemeral";
    ParentEnvironmentId: string;
}

export interface StaticDeploymentEnvironment extends DeploymentEnvironmentV2 {
    Type: "Static";
    AllowDynamicInfrastructure: boolean;
    ExtensionSettings: ExtensionSettingsValues[];
    UseGuidedFailure: boolean;
}

export interface ParentDeploymentEnvironment extends DeploymentEnvironmentV2 {
    Type: "Parent";
    UseGuidedFailure: boolean;
    AutomaticDeprovisioningRule: {
        ExpiryDays: number;
        ExpiryHours: number;
    };
}

export interface NewDeploymentEnvironment extends NewSpaceScopedResource, NewNamedResource {
    Description?: string;
    UseGuidedFailure?: boolean;
    AllowDynamicInfrastructure?: boolean;
    SortOrder?: number;
    ExtensionSettings?: ExtensionSettingsValues[];
}
