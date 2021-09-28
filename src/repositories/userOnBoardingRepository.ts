import type { OnboardingResource } from "@octopusdeploy/message-contracts";
import type { Client } from "../client";

export class UserOnBoardingRepository {
    private client: Client;

    constructor(client: Client) {
        this.client = client;
    }

    get(): Promise<OnboardingResource> {
        return this.client.get(this.client.getLink("UserOnboarding"));
    }
}