import type { UserRoleResource } from "@octopusdeploy/message-contracts";
import BasicRepository from "./basicRepository";
import type { Client } from "../client";

class UserRoleRepository extends BasicRepository<UserRoleResource, UserRoleResource> {
    constructor(client: Client) {
        super("UserRoles", client);
    }
}

export default UserRoleRepository;
