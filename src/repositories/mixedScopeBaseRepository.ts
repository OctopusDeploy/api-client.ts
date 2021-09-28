/* eslint-disable @typescript-eslint/no-explicit-any */

import type { ListArgs, AllArgs, ResourcesById } from "./basicRepository";
import BasicRepository from "./basicRepository";
import type { ResourceWithId, ResourceCollection } from "@octopusdeploy/message-contracts";

export interface SpaceQueryParameters {
    includeSystem: boolean;
    spaces: string[];
}
// includeSystem is set to true by default, can be overridden by args
class MixedScopeBaseRepository<TExistingResource extends ResourceWithId, TNewResource, TListArgs extends ListArgs = ListArgs, TAllArgs extends AllArgs = AllArgs, TGetArgs = {}> extends BasicRepository<TExistingResource, TNewResource, TListArgs> {
    list(args?: TListArgs): Promise<ResourceCollection<TExistingResource>> {
        const combinedArgs = super.extend(this.spacePartitionParameters(), args);
        return super.list(combinedArgs);
    }

    get(id: string, args?: TGetArgs): Promise<TExistingResource> {
        const allArgs = this.extend(args || {}, { id });
        const argsWithSpace = this.extend(allArgs, this.spacePartitionParameters());
        return super.get(id, argsWithSpace);
    }

    all(args?: TAllArgs): Promise<TExistingResource[]> {
        const combinedArgs = super.extend(this.spacePartitionParameters(), args);
        return super.all(combinedArgs);
    }

    allById(args?: any): Promise<ResourcesById<TExistingResource>> {
        const combinedArgs = super.extend(this.spacePartitionParameters(), args);
        return super.allById(combinedArgs);
    }

    protected spacePartitionParameters() {
        return convertToSpacePartitionParameters(this.client.spaceId, true);
    }
}

export function convertToSpacePartitionParameters(spaceId: string | null | "all", includeSystem: boolean) {
    const spaces = spaceId ? [spaceId] : [];
    return { includeSystem, spaces };
}

export default MixedScopeBaseRepository;
