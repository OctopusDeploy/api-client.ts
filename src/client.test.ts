import { Client } from "./client";
import type { ClientConfiguration } from "./clientConfiguration";

describe("client", () => {
    test("throws with invalid configuration", async () => {
        const clientConfiguration: ClientConfiguration = {
            apiKey: "API-XXXXXXXXXXXXXXXXXXXXXXXX",
            instanceUri: "123",
            autoConnect: true,
        };
        await expect(Client.create(clientConfiguration)).rejects.toThrow();
    });

    test("connects using space id", async () => {
        const clientConfiguration: ClientConfiguration = {
            apiKey: process.env["OCTOPUS_TEST_API_KEY"] || "",
            instanceUri: process.env["OCTOPUS_TEST_URI"] || "",
            space: "Spaces-1",
            autoConnect: true,
        };

        const client = await Client.create(clientConfiguration);
        expect(client.isConnected()).toBe(true);
    });

    test("connects using space name", async () => {
        const clientConfiguration: ClientConfiguration = {
            apiKey: process.env["OCTOPUS_TEST_API_KEY"] || "",
            instanceUri: process.env["OCTOPUS_TEST_URI"] || "",
            space: "Default",
            autoConnect: true,
        };

        const client = await Client.create(clientConfiguration);
        expect(client.isConnected()).toBe(true);
    });

    test("throws with invalid space", async () => {
        const clientConfiguration: ClientConfiguration = {
            apiKey: process.env["OCTOPUS_TEST_API_KEY"] || "",
            instanceUri: process.env["OCTOPUS_TEST_URI"] || "",
            space: "NonExistent",
            autoConnect: true,
        };

        await expect(Client.create(clientConfiguration)).rejects.toThrow();
    });
});
