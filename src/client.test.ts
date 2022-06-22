import { Client } from "./client";
import type { ClientConfiguration } from "./clientConfiguration";

describe("client", () => {
    test("throws with invalid configuration", async () => {
        const clientConfiguration: ClientConfiguration = {
            apiKey: "qwe",
            apiUri: "123",
            autoConnect: true,
        };
        await expect(Client.create(clientConfiguration)).rejects.toThrow();
    });
});
