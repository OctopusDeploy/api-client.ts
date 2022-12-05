/* eslint-disable @typescript-eslint/no-non-null-assertion */
import * as _ from "lodash";
import { Resource } from "../../../resource";
import type { ActionInputs } from "./actionInputs";
import type { ActionProperties } from "./actionProperties";
import type { DeploymentActionContainer } from "./deploymentActionContainer";
import { Feed, FeedType } from "../../feeds";
import { PackageAcquisitionLocation } from "./packageAcquisitionLocation";
import type { PackageReference } from "./packageReference";
import { PackageSelectionMode } from "./packageReference";
import type { RunConditionForAction } from "./runConditionForAction";

export type NameOrIdKey = "Name" | "Id";

function parseCSV(val: string): string[] {
    if (!val || val === "") {
        return [];
    }
    return val.split(",");
}

export interface DeploymentAction extends Resource {
    ActionType: string;
    CanBeUsedForProjectVersioning: boolean;
    Channels: string[];
    Condition?: RunConditionForAction;
    Container: DeploymentActionContainer;
    Environments: string[];
    ExcludedEnvironments: string[];
    Id: string;
    IsDisabled: boolean;
    IsRequired: boolean;
    Name: string;
    Notes: string | null;
    Packages: PackageReference[];
    Properties: ActionProperties;
    StepPackageVersion?: string;
    TenantTags: string[];
    Inputs?: ActionInputs;
    WorkerPoolId: string | null;
    WorkerPoolVariable: string | null;
}

export function IsDeployReleaseAction(action: DeploymentAction) {
    return !!action.Properties["Octopus.Action.DeployRelease.ProjectId"];
}

export function IsPrimaryPackageReference(pkg: PackageReference<any>): boolean {
    return !pkg.Name;
}

export function RemovePrimaryPackageReference(packages: Array<PackageReference<any>>): Array<PackageReference<any>> {
    return _.filter(packages, (pkg) => !IsPrimaryPackageReference(pkg));
}

// Returns true if the names match, where null and empty string are equivalent
export function PackageReferenceNamesMatch(nameA: string | undefined, nameB: string | undefined): boolean {
    if (!nameA) {
        return !nameB;
    }

    return nameA === nameB;
}

export function HasManualInterventionResponsibleTeams(action: DeploymentAction) {
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    return _.some(parseCSV(action.Properties["Octopus.Action.Manual.ResponsibleTeamIds"] as string));
}

export function GetPrimaryPackageReference(packages: undefined | Array<PackageReference<any>>): PackageReference<any> {
    return packages?.find((pkg) => IsPrimaryPackageReference(pkg))!;
}

export function IsNamedPackageReference(pkg: PackageReference): boolean {
    return !!pkg.Name;
}

export function GetNamedPackageReferences(packages: Array<PackageReference<any>>): Array<PackageReference<any>> {
    return RemovePrimaryPackageReference(packages);
}

export function SetNamedPackageReference(
    name: string,
    updated: Partial<PackageReference<any>>,
    packages: Array<PackageReference<any>>
): Array<PackageReference<any>> {
    return _.map(packages, (pkg) => {
        if (!PackageReferenceNamesMatch(name, pkg.Name!)) {
            return pkg;
        }
        return { ...pkg, ...updated };
    });
}

export function SetPrimaryPackageReference(updated: Partial<PackageReference<any>>, packages: Array<PackageReference<any>>): Array<PackageReference<any>> {
    return _.map(packages, (pkg) => {
        if (!IsPrimaryPackageReference(pkg)) {
            return pkg;
        }
        return { ...pkg, ...updated };
    });
}

export function InitialisePrimaryPackageReference(
    packages: Array<PackageReference<any>>,
    feeds: Feed[],
    itemsKeyedBy: NameOrIdKey
): Array<PackageReference<any>> {
    const primaryPackage = GetPrimaryPackageReference(packages);

    if (primaryPackage) {
        if (!primaryPackage.Properties.SelectionMode) {
            primaryPackage.Properties.SelectionMode = PackageSelectionMode.Immediate;
        }
        return [...packages];
    }

    const packagesWithoutDefault = RemovePrimaryPackageReference(packages);
    const builtInFeed: Feed | undefined = feeds.find((f) => f.FeedType === FeedType.BuiltIn);
    const builtInFeedIdOrName: string | undefined = builtInFeed && builtInFeed[itemsKeyedBy];

    return [
        {
            Id: null!,
            PackageId: null!,
            FeedId: builtInFeedIdOrName!,
            AcquisitionLocation: PackageAcquisitionLocation.Server,
            Properties: {
                SelectionMode: PackageSelectionMode.Immediate,
            },
        },
        ...packagesWithoutDefault,
    ];
}
