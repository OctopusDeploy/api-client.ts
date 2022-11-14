import { Client } from "./client";
import type { ClientConfiguration } from "./clientConfiguration";

describe("client", () => {
    test("throws with invalid configuration", async () => {
        const clientConfiguration: ClientConfiguration = {
            userAgentApp: "Test",
            apiKey: "API-XXXXXXXXXXXXXXXXXXXXXXXX",
            instanceURL: "123",
            autoConnect: true,
        };
        await expect(Client.create(clientConfiguration)).rejects.toThrow();
    });

    test("connects using space id", async () => {
        const clientConfiguration: ClientConfiguration = {
            userAgentApp: "Test",
            apiKey: process.env["OCTOPUS_TEST_API_KEY"] || "",
            instanceURL: process.env["OCTOPUS_TEST_URL"] || "",
            space: "Spaces-1",
            autoConnect: true,
        };

        const client = await Client.create(clientConfiguration);
        expect(client.isConnected()).toBe(true);
    });

    test("connects using space name", async () => {
        const clientConfiguration: ClientConfiguration = {
            userAgentApp: "Test",
            apiKey: process.env["OCTOPUS_TEST_API_KEY"] || "",
            instanceURL: process.env["OCTOPUS_TEST_URL"] || "",
            space: "Default",
            autoConnect: true,
        };

        const client = await Client.create(clientConfiguration);
        expect(client.isConnected()).toBe(true);
    });

    test("throws with invalid space", async () => {
        const clientConfiguration: ClientConfiguration = {
            userAgentApp: "Test",
            apiKey: process.env["OCTOPUS_TEST_API_KEY"] || "",
            instanceURL: process.env["OCTOPUS_TEST_URL"] || "",
            space: "NonExistent",
            autoConnect: true,
        };

        await expect(Client.create(clientConfiguration)).rejects.toThrow();
    });
});
