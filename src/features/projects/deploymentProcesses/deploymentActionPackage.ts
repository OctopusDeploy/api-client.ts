/* eslint-disable @typescript-eslint/no-non-null-assertion */
import * as _ from "lodash";
import type { DeploymentAction } from "./deploymentAction";

export interface DeploymentActionPackage {
    DeploymentAction: string;
    PackageReference?: string;
}

export function displayName(pkg: DeploymentActionPackage) {
    return !!pkg.PackageReference ? `${pkg.DeploymentAction}/${pkg.PackageReference}` : pkg.DeploymentAction;
}

export function deploymentActionPackages(actions: DeploymentAction[]) {
    return _.chain(actions)
        .flatMap((action) =>
            _.map(action.Packages, (pkg) => ({
                DeploymentAction: action.Name,
                PackageReference: pkg.Name!,
            }))
        )
        .value();
}
