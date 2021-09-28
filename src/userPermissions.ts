/* eslint-disable no-eq-null */
/* eslint-disable @typescript-eslint/consistent-type-assertions */

import type { Permission, Permissions, UserPermissionRestriction, ProjectedTeamReferenceDataItem, SpaceResource } from "@octopusdeploy/message-contracts";
import { isAllEnvironments, isAllProjectGroups, isAllProjects, isAllTenants } from "@octopusdeploy/message-contracts";

type AccessToAllProjects = "Access to all projects";
type AccessToAllEnvironments = "Access to all environments";
type AccessToAllProjectGroups = "Access to all project groups";
type AccessToAllTenants = "Access to all tenants";

type AccessToSubsetOfProjects = string[];
type AccessToSubsetOfEnvironments = string[];
type AccessToSubsetOfProjectGroups = string[];
type AccessToSubsetOfTenants = string[];

type AccessToProjects = AccessToSubsetOfProjects | AccessToAllProjects;
type AccessToEnvironments = AccessToSubsetOfEnvironments | AccessToAllEnvironments;
type AccessToProjectGroups = AccessToSubsetOfProjectGroups | AccessToAllProjectGroups;
type AccessToTenants = AccessToSubsetOfTenants | AccessToAllTenants;

interface InternalPermission {
    projectIds: AccessToProjects;
    environmentIds: AccessToEnvironments;
    projectGroupIds: AccessToProjectGroups;
    tenantIds: AccessToTenants;
}

type SpaceId = string;
type PermissionAsString = string;
type InternalPermissions = Record<SpaceId, Record<PermissionAsString, InternalPermission[]>>;

interface Authorization {
    permission: Permission;
    projectId?: string;
    environmentId?: string;
    projectGroupId?: string;
    tenantId?: string;
}

export class UserPermissions {
    public static Create(spacePermissions: Permissions, systemPermissions: string[], teams: ProjectedTeamReferenceDataItem[]): UserPermissions {
        const ps: InternalPermissions = {};
        Object.keys(spacePermissions).forEach((permission) => {
            const permissionRestrictionInAllSpaces = spacePermissions[permission];
            permissionRestrictionInAllSpaces.forEach((permissionRestriction) => {
                const permissionsForSpace = ps[permissionRestriction.SpaceId];
                if (!permissionsForSpace) {
                    ps[permissionRestriction.SpaceId] = {};
                }
                const internalPermission = convertUserPermissionRestrictionToInternalPermissions(permissionRestriction);
                const restrictionsWithinSpace = ps[permissionRestriction.SpaceId][permission.toLowerCase()];
                if (!restrictionsWithinSpace) {
                    ps[permissionRestriction.SpaceId][permission.toLowerCase()] = [];
                }
                ps[permissionRestriction.SpaceId][permission.toLowerCase()].push(internalPermission);
            });
        });
        return new UserPermissions(
            ps,
            systemPermissions.map((p) => p.toLowerCase()),
            teams
        );
    }

    constructor(private readonly spacePermissions: InternalPermissions, private readonly systemPermissions: string[], private readonly teams: ProjectedTeamReferenceDataItem[]) { }

    scopeToSystem(): UserPermissions {
        return new UserPermissions({}, this.systemPermissions, this.teams);
    }

    scopeToSpace(spaceId: string | null): UserPermissions {
        if (!spaceId) {
            return new UserPermissions({}, [], this.teams);
        }
        const permissionsForSpace = this.spacePermissions[spaceId] || {};
        return new UserPermissions({ [spaceId]: permissionsForSpace }, [], this.teams);
    }

    scopeToSpaceAndSystem(spaceId: string | null): UserPermissions {
        if (!spaceId) {
            return new UserPermissions({}, this.systemPermissions, this.teams);
        }
        const permissionsForSpace = this.spacePermissions[spaceId] || {};
        return new UserPermissions({ [spaceId]: permissionsForSpace }, this.systemPermissions, this.teams);
    }

    hasAnyPermissions(): boolean {
        const hasAnySpacePermissions = Object.keys(this.spacePermissions).some((spaceId) => {
            return Object.keys(this.spacePermissions[spaceId]).length > 0;
        });
        const hasAnySystemPermissions = this.systemPermissions.length > 0;
        return hasAnySpacePermissions || hasAnySystemPermissions;
    }

    firstAuthorized(permissions: Permission[]): Permission | undefined {
        return permissions.find((p) => {
            return this.hasSpacePermission(p) || this.hasSystemPermission(p);
        });
    }

    hasPermissionInAnyScope(permission: Permission): boolean {
        return this.hasSpacePermission(permission) || this.hasSystemPermission(permission);
    }

    isAuthorized(authorization: Authorization): boolean {
        const isInSystemPermissions = this.systemPermissions.includes(authorization.permission.toLowerCase());

        if (isInSystemPermissions) {
            // these are not scoped, so if the permission is here, we're done they are Authorized
            return true;
        }

        return this.isAuthorizedInAnySpace(authorization);
    }

    isAuthorizedInAnySpace(authorization: Authorization): boolean {
        return Object.keys(this.spacePermissions).some((spaceId) => {
            return isAuthorizedInSpecificSpace(this.spacePermissions[spaceId]);
        });

        function isAuthorizedInSpecificSpace(specificSpacePermissions: Record<PermissionAsString, InternalPermission[]>) {
            const restrictions = specificSpacePermissions[authorization.permission.toLowerCase()];
            if (!restrictions) {
                // User doesn't have the permission in any scope
                return false;
            }

            if (restrictions.length === 0) {
                // No restrictions
                return true;
            }

            for (const restriction of restrictions) {
                let allowed = true;

                if (!isAccessToAllProjects(restriction.projectIds)) {
                    if (authorization.projectId == null || (!isWildcard(authorization.projectId) && !restriction.projectIds.includes(authorization.projectId.toLowerCase()))) {
                        allowed = false;
                    }
                }

                if (!isAccessToAllEnvironments(restriction.environmentIds)) {
                    if (authorization.environmentId == null || (!isWildcard(authorization.environmentId) && !restriction.environmentIds.includes(authorization.environmentId.toLowerCase()))) {
                        allowed = false;
                    }
                }

                if (!isAccessToAllProjectGroups(restriction.projectGroupIds)) {
                    if (authorization.projectGroupId == null || (!isWildcard(authorization.projectGroupId) && !restriction.projectGroupIds.includes(authorization.projectGroupId.toLowerCase()))) {
                        allowed = false;
                    }
                }

                if (!isAccessToAllTenants(restriction.tenantIds)) {
                    if (authorization.tenantId == null || (!isWildcard(authorization.tenantId) && !restriction.tenantIds.includes(authorization.tenantId.toLowerCase()))) {
                        allowed = false;
                    }
                }

                if (allowed) {
                    return true;
                }
            }

            return false;

            function isWildcard(s: string): boolean {
                return s === "*";
            }
        }
    }

    isSpaceManager(space: SpaceResource): boolean {
        return space && space.SpaceManagersTeams.some((t) => this.teams.some((cpt) => cpt.Id === t));
    }

    private hasSpacePermission(permission: Permission): boolean {
        const lowerCasePermission = permission.toLowerCase();
        return Object.keys(this.spacePermissions).some((spaceId) => {
            return !!this.spacePermissions[spaceId][lowerCasePermission];
        });
    }

    private hasSystemPermission(permission: Permission): boolean {
        return this.systemPermissions.includes(permission.toLowerCase());
    }
}
// This type is distinct from `UserPermissionRestriction` because it is safer to have the "all" case represented by a non-array
// It is harder to make type mistakes this way, since you should be unable to assign the "all" string value to the array representing a subset of values
function convertUserPermissionRestrictionToInternalPermissions(permissionRestriction: UserPermissionRestriction): InternalPermission {
    const normalizedProjectRestrictions: AccessToProjects = isAllProjects(permissionRestriction.RestrictedToProjectIds) ? "Access to all projects" : permissionRestriction.RestrictedToProjectIds.map((id: string) => id.toLowerCase());
    const normalizedEnvironmentRestrictions: AccessToEnvironments = isAllEnvironments(permissionRestriction.RestrictedToEnvironmentIds)
        ? "Access to all environments"
        : permissionRestriction.RestrictedToEnvironmentIds.map((id: string) => id.toLowerCase());
    const normalizedProjectGroupIds: AccessToProjectGroups = isAllProjectGroups(permissionRestriction.RestrictedToProjectGroupIds)
        ? "Access to all project groups"
        : permissionRestriction.RestrictedToProjectGroupIds.map((id: string) => id.toLowerCase());
    const normalizedTenantIds: AccessToTenants = isAllTenants(permissionRestriction.RestrictedToTenantIds) ? "Access to all tenants" : permissionRestriction.RestrictedToTenantIds.map((id: string) => id.toLowerCase());
    return {
        projectIds: normalizedProjectRestrictions,
        environmentIds: normalizedEnvironmentRestrictions,
        projectGroupIds: normalizedProjectGroupIds,
        tenantIds: normalizedTenantIds,
    };
}

export function isAccessToAllProjects(restrictions: AccessToProjects): restrictions is AccessToAllProjects {
    const accessToAllProjects = restrictions as AccessToAllProjects;
    return typeof accessToAllProjects === "string" && accessToAllProjects === "Access to all projects";
}

export function isAccessToAllEnvironments(restrictions: AccessToEnvironments): restrictions is AccessToAllEnvironments {
    const accessToAllEnvironments = restrictions as AccessToAllEnvironments;
    return typeof accessToAllEnvironments === "string" && accessToAllEnvironments === "Access to all environments";
}

export function isAccessToAllTenants(restrictions: AccessToTenants): restrictions is AccessToAllTenants {
    const accessToAllTenants = restrictions as AccessToAllTenants;
    return typeof accessToAllTenants === "string" && accessToAllTenants === "Access to all tenants";
}

export function isAccessToAllProjectGroups(restrictions: AccessToProjectGroups): restrictions is AccessToAllProjectGroups {
    const accessToAllProjectGroups = restrictions as AccessToAllProjectGroups;
    return typeof accessToAllProjectGroups === "string" && accessToAllProjectGroups === "Access to all project groups";
}
