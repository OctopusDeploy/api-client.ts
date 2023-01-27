import { Client } from "../../client";
import { processConfiguration } from "../../clientConfiguration.test";
import { checkForCapability } from "./capability";

describe("Check capabilities", () => {
    let client: Client;

    beforeAll(async () => {
        client = await Client.create(processConfiguration());
        console.log(`Client connected to API endpoint successfully.`);
    });

    test("Returns no error for something we know exists", async () => {
        const result = await checkForCapability(client, "GetAllSpacesRequest");
        expect(result).toBeNull();
    });

    test("Returns false for something we know does not exist", async () => {
        const result = await checkForCapability(client, "SomeMadeUpRequest");
        expect(result).toBe(
            "The Octopus instance does not support SomeMadeUpRequest, you may need to upgrade it to get access to the feature you are trying to use."
        );
    });
});
