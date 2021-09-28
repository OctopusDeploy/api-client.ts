import type { SubscriptionResource, NewSubscriptionResource } from "@octopusdeploy/message-contracts";
import type { Client } from "../client";
import { BasicRepository } from "./basicRepository";

class SubscriptionRepository extends BasicRepository<SubscriptionResource, NewSubscriptionResource> {
    constructor(client: Client) {
        super("Subscriptions", client);
    }
}

export default SubscriptionRepository;
