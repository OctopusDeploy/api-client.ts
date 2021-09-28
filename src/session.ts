/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable no-eq-null */

import type { FeaturesConfigurationResource, UserPermissionSetResource, UserResource } from "@octopusdeploy/message-contracts";
import { UserPermissions } from "./userPermissions";

export class Session {
    currentUser: UserResource | null = undefined!;
    currentPermissions: UserPermissions | null = undefined!;

    start(user: UserResource, features: FeaturesConfigurationResource) {
        console.info(`Starting session for ${user.DisplayName} user.`);
        this.currentUser = user;
    }

    end() {
        if (this.currentUser) {
            console.info(`Ending session for ${this.currentUser.DisplayName} user.`);
        }
        this.currentUser = null;
        this.currentPermissions = null;
    }

    refreshPermissions(userPermission: UserPermissionSetResource) {
        this.currentPermissions = UserPermissions.Create(userPermission.SpacePermissions, userPermission.SystemPermissions, userPermission.Teams);
    }

    isAuthenticated() {
        return this.currentUser != null;
    }
}

export default Session;
