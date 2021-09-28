import { Client } from "../client";

class WorkerShellsRepository {
    private client: Client;
    constructor(client: Client) {
        this.client = client;
    }
    all(): Promise<string[]> {
        return this.client.get(this.client.getLink("WorkerShells"));
    }
}

export default WorkerShellsRepository;
