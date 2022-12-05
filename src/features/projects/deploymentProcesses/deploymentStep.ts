import { Resource } from "../../../resource";
import type { ActionProperties } from "./actionProperties";
import type { DeploymentAction } from "./deploymentAction";
import type { NewNamedResource } from "../../../namedResource";

export interface DeploymentStep extends Resource {
    Id: string;
    Name: string;
    Properties: ActionProperties;
    Condition: RunCondition;
    StartTrigger: StartTrigger;
    PackageRequirement: PackageRequirement;
    Actions: DeploymentAction[];
}

export interface NewDeploymentStep extends NewNamedResource {
    Properties: ActionProperties;
    Condition: RunCondition;
    StartTrigger: StartTrigger;
    PackageRequirement: PackageRequirement;
    Actions: DeploymentAction[];
}

export enum StartTrigger {
    StartWithPrevious = "StartWithPrevious",
    StartAfterPrevious = "StartAfterPrevious",
}

export enum RunCondition {
    Success = "Success",
    Failure = "Failure",
    Always = "Always",
    Variable = "Variable",
}

export enum PackageRequirement {
    LetOctopusDecide = "LetOctopusDecide",
    BeforePackageAcquisition = "BeforePackageAcquisition",
    AfterPackageAcquisition = "AfterPackageAcquisition",
}
