import { Client } from "../../client";
import { apiLocation } from "../../apiLocation";

export class ServerTaskRepository {
    private baseApiPathTemplate = `${apiLocation}/tasks`;
    private readonly client: Client;

    constructor(client: Client) {
        this.client = client;
    }

    async cancel(serverTaskId: string): Promise<void> {
        if (!serverTaskId) {
            throw new Error("Server Task Id was not provided");
        }
        
        await this.client.post<void>(`${this.baseApiPathTemplate}/${serverTaskId}/cancel`, {});
    }
}