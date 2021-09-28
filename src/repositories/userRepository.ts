import type {
    ApiKeyCreatedResource,
    ApiKeyResource,
    LoginCommand,
    ResourceCollection,
    SpaceResource,
    UserResource
} from "@octopusdeploy/message-contracts";
import { BasicRepository } from "./basicRepository";
import type { Client } from "../client";

class UserRepository extends BasicRepository<UserResource, UserResource> {
    constructor(client: Client) {
        super("Users", client);
    }

    createApiKey(user: UserResource, purpose: any, expires: Date | null): Promise<ApiKeyCreatedResource> {
        return this.client.post(user.Links["ApiKeys"], { Purpose: purpose, Expires: expires });
    }

    getCurrent() {
        return this.client.get<UserResource>(this.client.getLink("CurrentUser"));
    }

    getSpaces(user: UserResource) {
        return this.client.get<SpaceResource[]>(user.Links["Spaces"]);
    }

    getTriggers(user: UserResource) {
        return this.client.get(user.Links["Triggers"]);
    }

    listApiKeys(user: UserResource): Promise<ResourceCollection<ApiKeyResource>> {
        return this.client.get(user.Links["ApiKeys"], { take: this.takeAll });
    }

    register(registerCommand: any) {
        return this.client.post(this.client.getLink("Register"), registerCommand);
    }

    revokeApiKey(apiKey: ApiKeyResource) {
        return this.client.del(apiKey.Links["Self"]);
    }

    signIn(loginCommand: LoginCommand): Promise<UserResource> {
        return this.client.post<UserResource>(this.client.getLink("SignIn"), loginCommand).then((authenticatedUser) => {
            const antiforgeryToken = this.client.getAntiforgeryToken();
            if (!antiforgeryToken) {
                throw new Error("The required anti-forgery cookie is missing. Perhaps your browser " + "or another network device is blocking cookies? " + "See http://g.octopushq.com/CSRF for more details and troubleshooting.");
            }
            return authenticatedUser;
        });
    }

    signOut() {
        return this.client.post(this.client.getLink("SignOut"), {});
    }
}

export default UserRepository;
