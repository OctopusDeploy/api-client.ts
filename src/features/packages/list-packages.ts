import { Client, ListArgs, ResourceCollection, spaceScopedRoutePrefix } from "../..";
import { Package } from "./package";

type PackagesListArgs = {
    nuGetPackageId?: string;
    filter?: string;
    latest?: boolean;
    includeNotes?: boolean;
} & ListArgs;

export async function packagesList(client: Client, spaceName: string, args?: PackagesListArgs): Promise<ResourceCollection<Package>> {
    const response = await client.request<ResourceCollection<Package>>(
        `${spaceScopedRoutePrefix}/packages{/id}{?nuGetPackageId,filter,latest,skip,take,includeNotes}`,
        {
            spaceName,
            ...args,
        }
    );
    return response;
}
