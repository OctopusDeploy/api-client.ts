import type { UserPermissionSetResource, UserResource } from "@octopusdeploy/message-contracts";
import type { Client } from "../client";
import { convertToSpacePartitionParameters } from "./mixedScopeBaseRepository";

class UserPermissionRepository {
    private client: Client;
    constructor(client: Client) {
        this.client = client;
    }

    getAllPermissions(user: UserResource, includeSystem: boolean) {
        return this.client.get<UserPermissionSetResource>(user.Links["Permissions"], convertToSpacePartitionParameters("all", includeSystem));
    }

    getPermissionsForCurrentSpaceContext(user: UserResource, includeSystem: boolean) {
        return this.client.get<UserPermissionSetResource>(user.Links["Permissions"], convertToSpacePartitionParameters(this.client.spaceId, includeSystem));
    }

    getPermissionsConfigurationForAllParitions(user: UserResource, includeSystem: boolean) {
        return this.client.get<UserPermissionSetResource>(user.Links["PermissionsConfiguration"], convertToSpacePartitionParameters("all", includeSystem));
    }

    getPermissionsConfigurationForCurrentSpaceContext(user: UserResource, includeSystem: boolean) {
        return this.client.get<UserPermissionSetResource>(user.Links["PermissionsConfiguration"], convertToSpacePartitionParameters(this.client.spaceId, includeSystem));
    }
}

export default UserPermissionRepository;
