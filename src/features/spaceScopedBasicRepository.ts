import { NewSpaceScopedResource, SpaceScopedResource } from "../spaceScopedResource";
import { Client } from "../client";
import { RouteArgs } from "../resolver";
import { ListArgs, BasicRepository } from "./basicRepository";
import { ResourceCollection } from "../resourceCollection";
import { spaceScopedRoutePrefix } from "../spaceScopedRoutePrefix";

export class SpaceScopedBasicRepository<
    TExistingResource extends SpaceScopedResource,
    TNewResource extends NewSpaceScopedResource,
    TListArgs extends ListArgs & RouteArgs = ListArgs,
    TCreateArgs extends RouteArgs = RouteArgs,
    TModifyArgs extends RouteArgs = RouteArgs
> extends BasicRepository<TExistingResource, TNewResource, TListArgs, TCreateArgs, TModifyArgs> {
    protected readonly spaceName: string;

    constructor(client: Client, spaceName: string, baseApiPathTemplate: string, listParametersTemplate: string) {
        super(client, baseApiPathTemplate, listParametersTemplate);
        if (!baseApiPathTemplate.startsWith(spaceScopedRoutePrefix)) {
            throw new Error("Space scoped repositories must prefix their baseApiTemplate with `spaceScopedRoutePrefix`");
        }
        this.spaceName = spaceName;
    }

    override del(resource: TExistingResource) {
        return this.client
            .del(`${this.baseApiPathTemplate}/${resource.Id}`, { spaceName: this.spaceName })
            .then((d) => this.notifySubscribersToDataModifications(resource));
    }

    override create(resource: TNewResource, args?: TCreateArgs): Promise<TExistingResource> {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        return super.create(resource, { spaceName: this.spaceName, ...args! });
    }

    override get(id: string): Promise<TExistingResource> {
        return this.client.request(`${this.baseApiPathTemplate}/${id}`, { spaceName: this.spaceName });
    }

    override list(args?: TListArgs): Promise<ResourceCollection<TExistingResource>> {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        return super.list({ spaceName: this.spaceName, ...args! });
    }

    override modify(resource: TExistingResource, args?: TModifyArgs): Promise<TExistingResource> {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        return super.modify(resource, { spaceName: this.spaceName, ...args! });
    }
}
