import type { AuthenticationResource, LoginInitiatedResource } from "@octopusdeploy/message-contracts";
import { BasicRepository } from "./basicRepository";
import type { Client } from "../client";

export class AuthenticationRepository extends BasicRepository<AuthenticationResource, AuthenticationResource> {
    constructor(client: Client) {
        super("Authentication", client);
    }

    get(): Promise<AuthenticationResource> {
        return this.client.get<AuthenticationResource>(this.client.getLink("Authentication"));
    }

    wasLoginInitiated(encodedQueryString: string): Promise<LoginInitiatedResource> {
        return this.client.post<LoginInitiatedResource>(this.client.getLink("LoginInitiated"), { EncodedQueryString: encodedQueryString });
    }
}