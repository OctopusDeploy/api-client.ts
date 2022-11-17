import { NewSpaceScopedResourceV2, SpaceScopedResourceV2 } from "..";
import { Client } from "../client";
import { RouteArgs } from "../resolver";
import { ListArgsV2, BasicRepositoryV2 } from "./basicRepositoryV2";
import { ResourceCollectionV2 } from "./resourceCollectionV2";


export class SpaceScopedBasicRepositoryV2<
    TExistingResource extends SpaceScopedResourceV2,
    TNewResource extends NewSpaceScopedResourceV2,
    TListArgs extends ListArgsV2 & RouteArgs = ListArgsV2,
    TGetArgs extends RouteArgs = {},
    TCreateArgs extends RouteArgs = {},
    TModifyArgs extends RouteArgs = {}
> extends BasicRepositoryV2<TExistingResource, TNewResource, TListArgs, TGetArgs, TCreateArgs, TModifyArgs> {

    protected readonly spaceName: string;

    constructor(client: Client, spaceName: string, baseApiTemplate: string) {
        super(client, baseApiTemplate);
        this.spaceName = spaceName;
    }

    override create(resource: TNewResource, args?: TCreateArgs | undefined): Promise<TExistingResource> {
        return super.create(resource, { spaceName: this.spaceName, ...args! });
    }

    override get(id: string, args?: TGetArgs): Promise<TExistingResource> {
        const allArgs = this.extend(args || {}, { id });
        return this.client.request(this.baseApiTemplate, { spaceName: this.spaceName, ...allArgs });
    }

    list(args?: TListArgs): Promise<ResourceCollectionV2<TExistingResource>> {
        return this.client.request(this.baseApiTemplate, { spaceName: this.spaceName, ...args });
    }

    modify(resource: TExistingResource, args?: TModifyArgs): Promise<TExistingResource> {
        return super.modify(resource, args);
    }
}
