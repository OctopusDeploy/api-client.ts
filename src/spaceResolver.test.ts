import type { Client } from "./client";
import { Space } from "./features/spaces/space";
import { resolveSpaceId } from "./spaceResolver";

// resolveSpaceId memoises results in module scope, so each test uses a distinct
// name/id to keep the cases independent.
function space(id: string, name: string): Space {
    return {
        Id: id,
        Name: name,
        Slug: name.toLowerCase().replace(/\s/g, "-"),
        IsDefault: false,
        SpaceManagersTeamMembers: [],
        SpaceManagersTeams: [],
        TaskQueueStopped: false,
    };
}

function clientReturning(handlers: { byName?: Space[]; byId?: Space }): { client: Client; paths: string[] } {
    const paths: string[] = [];
    const client = {
        debug: () => undefined,
        error: () => undefined,
        get: (path: string) => {
            paths.push(path);
            if (path.includes("partialName=")) {
                const items = handlers.byName ?? [];
                return Promise.resolve({ Items: items, TotalResults: items.length });
            }
            if (handlers.byId) return Promise.resolve(handlers.byId);
            return Promise.reject(new Error("404 not found"));
        },
    } as unknown as Client;
    return { client, paths };
}

describe("resolveSpaceId", () => {
    test("resolves an exact name match", async () => {
        const target = space("Spaces-11", "By Name");
        const { client } = clientReturning({ byName: [target] });
        await expect(resolveSpaceId(client, "By Name")).resolves.toBe("Spaces-11");
    });

    test("ignores a partial name match that is not exact", async () => {
        const { client } = clientReturning({ byName: [space("Spaces-12", "Partial Match Longer")] });
        await expect(resolveSpaceId(client, "Partial Match")).rejects.toThrow("Unable to resolve space name or id 'Partial Match'");
    });

    test("resolves a space id when no name matches", async () => {
        const { client } = clientReturning({ byName: [], byId: space("Spaces-1795", "Swordfish") });
        await expect(resolveSpaceId(client, "Spaces-1795")).resolves.toBe("Spaces-1795");
    });

    test("prefers a name match over an id match", async () => {
        const named = space("Spaces-13", "Spaces-9999");
        const { client, paths } = clientReturning({ byName: [named], byId: space("Spaces-9999", "Other") });
        await expect(resolveSpaceId(client, "Spaces-9999")).resolves.toBe("Spaces-13");
        expect(paths.filter((p) => !p.includes("partialName="))).toHaveLength(0);
    });

    test("does not attempt an id lookup for a value that is not id-shaped", async () => {
        const { client, paths } = clientReturning({ byName: [] });
        await expect(resolveSpaceId(client, "Not An Id")).rejects.toThrow("No spaces exist with name or id 'Not An Id'");
        expect(paths.filter((p) => !p.includes("partialName="))).toHaveLength(0);
    });

    test("throws when an id-shaped value matches no space", async () => {
        const { client } = clientReturning({ byName: [] });
        await expect(resolveSpaceId(client, "Spaces-4242")).rejects.toThrow("No spaces exist with name or id 'Spaces-4242'");
    });
});
