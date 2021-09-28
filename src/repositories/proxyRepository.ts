import type { ProxyResource } from "@octopusdeploy/message-contracts";
import { BasicRepository } from "./basicRepository";
import type { Client } from "../client";

export class ProxyRepository extends BasicRepository<ProxyResource, any> {
    constructor(client: Client) {
        super("Proxies", client);
    }
}