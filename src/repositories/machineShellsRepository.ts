import type { Client } from "../client";

export class MachineShellsRepository {
    private client: Client;
    constructor(client: Client) {
        this.client = client;
    }
    all(): Promise<string[]> {
        return this.client.get(this.client.getLink("MachineShells"));
    }
}