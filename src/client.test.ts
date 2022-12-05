import { Client } from "./client";
import type { ClientConfiguration } from "./clientConfiguration";

describe("client", () => {
    test("throws with invalid configuration", async () => {
        const clientConfiguration: ClientConfiguration = {
            userAgentApp: "Test",
            apiKey: "API-XXXXXXXXXXXXXXXXXXXXXXXX",
            instanceURL: "123",
        };
        await expect(Client.create(clientConfiguration)).rejects.toThrow();
    });
});
