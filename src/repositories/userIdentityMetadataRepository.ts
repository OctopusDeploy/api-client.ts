import type {
    UserAuthenticationResource,
    UserIdentityMetadataResource
} from "@octopusdeploy/message-contracts";
import type { Client } from "../client";

class UserIdentityMetadataRepository {
    private client: Client;
    constructor(client: Client) {
        this.client = client;
    }

    all(): Promise<UserIdentityMetadataResource> {
        return this.client.get(this.client.getLink("UserIdentityMetadata"));
    }

    authenticationConfiguration(userId: string) {
        return this.client.get<UserAuthenticationResource>(this.client.getLink("UserAuthentication"), { userId });
    }
}

export default UserIdentityMetadataRepository;
