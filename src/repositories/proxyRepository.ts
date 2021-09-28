/* eslint-disable @typescript-eslint/no-explicit-any */

import BasicRepository from "./basicRepository";
import type { Client } from "../client";
import type { ProxyResource } from "@octopusdeploy/message-contracts";

class ProxyRepository extends BasicRepository<ProxyResource, any> {
    constructor(client: Client) {
        super("Proxies", client);
    }
}

export default ProxyRepository;
