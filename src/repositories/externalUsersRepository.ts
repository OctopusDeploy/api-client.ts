/* eslint-disable @typescript-eslint/no-explicit-any */

import type { Client } from "../client";

class ExternalUsersRepository {
    private client: Client;
    constructor(client: Client) {
        this.client = client;
    }
    search(partialName: string) {
        return this.client.get(this.client.getLink("ExternalUserSearch"), { partialName });
    }
    searchProvider(providerUrl: any, partialName: string): Promise<any> {
        return this.client.get(providerUrl, { partialName });
    }
}

export default ExternalUsersRepository;
