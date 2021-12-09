import { createRelease } from "./create-release";

describe("create a release", () => {
    test("with a simple project", async () => {
        const serverEndpoint = process.env.OCTOPUS_SERVER as string;

        await createRelease(
            {
                autoConnect: true,
                apiUri: serverEndpoint,
                apiKey: process.env.OCTOPUS_API_KEY as string,
            },
            serverEndpoint,
            "Spaces-1",
            "test",
            undefined,
            { deployTo: ["Dev"] }
        );
    }, 100000);
});
