import type { Client } from "../../../client";
import { CreateReleaseCommandV1 } from "./createReleaseCommandV1";
import { ReleaseRepository } from "./releaseRepository";

describe("CreateReleaseCommandV1", () => {
    test("create posts GitResources in the create/v1 request body", async () => {
        const doCreate = jest.fn().mockResolvedValue({ ReleaseId: "Releases-1", ReleaseVersion: "1.0.0" });
        // A minimal stand-in for Client exercising only the members create() touches.
        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
        const client = {
            getServerInformation: jest.fn().mockResolvedValue({ version: "2022.4.0" }),
            debug: jest.fn(),
            error: jest.fn(),
            doCreate,
        } as unknown as Client;

        const command: CreateReleaseCommandV1 = {
            spaceName: "Spaces-1",
            ProjectName: "My Project",
            GitResources: ["Update Argo Manifests:refs/heads/feature-x"],
        };

        await new ReleaseRepository(client, "Default").create(command);

        expect(doCreate).toHaveBeenCalledTimes(1);
        const [path, body] = doCreate.mock.calls[0];
        expect(path).toContain("/releases/create/v1");
        expect(body.GitResources).toEqual(["Update Argo Manifests:refs/heads/feature-x"]);
    });
});
