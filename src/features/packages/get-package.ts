import { Client, spaceScopedRoutePrefix } from "../..";
import { Package } from "./package";

export async function packageGet(client: Client, spaceName: string, packageId: string): Promise<Package> {
    if (!packageId) {
        throw new Error("Package Id was not provided");
    }
    const response = await client.request<Package>(`${spaceScopedRoutePrefix}/packages{/packageId}`, {
        spaceName,
        packageId,
    });
    return response;
}
