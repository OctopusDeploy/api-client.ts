import type { NewScopedUserRoleResource, ScopedUserRoleResource } from "@octopusdeploy/message-contracts";
import type { Client } from "../client";
import { MixedScopeBaseRepository } from "./mixedScopeBaseRepository";

export class ScopedUserRoleRepository extends MixedScopeBaseRepository<ScopedUserRoleResource, NewScopedUserRoleResource> {
    constructor(client: Client) {
        super("ScopedUserRoles", client);
    }
}