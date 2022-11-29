import { NewSpaceScopedResource, SpaceScopedResource } from "./spaceScopedResource";
import { Client } from "../client";
import { RouteArgs } from "../resolver";
import { ListArgs, BasicRepository } from "./basicRepository";
import { ResourceCollection } from "./resourceCollection";
import { spaceScopedRoutePrefix } from "./spaceScopedRoutePrefix";

export class SpaceScopedBasicRepository<
    TExistingResource extends SpaceScopedResource,
    TNewResource extends NewSpaceScopedResource,
    TListArgs extends ListArgs & RouteArgs = ListArgs,
    TCreateArgs extends RouteArgs = RouteArgs,
    TModifyArgs extends RouteArgs = RouteArgs
> extends BasicRepository<TExistingResource, TNewResource, TListArgs, TCreateArgs, TModifyArgs> {
    protected readonly spaceName: string;

    constructor(client: Client, spaceName: string, baseApiTemplate: string) {
        super(client, baseApiTemplate);
        if (!baseApiTemplate.startsWith(spaceScopedRoutePrefix)) {
            throw new Error("Space scoped repositories must prefix their baseApiTemplate with `spaceScopedRoutePrefix`");
        }
        this.spaceName = spaceName;
    }

    override create(resource: TNewResource, args?: TCreateArgs): Promise<TExistingResource> {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        return super.create(resource, { spaceName: this.spaceName, ...args! });
    }

    override get(id: string): Promise<TExistingResource> {
        return this.client.request(this.baseApiTemplate, { id, spaceName: this.spaceName });
    }

    list(args?: TListArgs): Promise<ResourceCollection<TExistingResource>> {
        return this.client.request(this.baseApiTemplate, { spaceName: this.spaceName, ...args });
    }

    modify(resource: TExistingResource, args?: TModifyArgs): Promise<TExistingResource> {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        return super.modify(resource, { spaceName: this.spaceName, ...args! });
    }
}
