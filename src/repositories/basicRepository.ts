import type { ResourceCollection, ResourceWithId } from "@octopusdeploy/message-contracts";
import type { Client, GlobalAndSpaceRootLinks } from "../client";
import type { Dictionary } from "lodash";
import { chunk, flatten } from "lodash";
import type { RouteArgs } from "../resolver";

export type ListArgs = {
    skip?: number;
    take?: number;
};

export type AllArgs = {
    ids?: string[];
};

export type ResourcesById<TResource> = { [id: string]: TResource };

//Although this is exactly the same as `ResourcesById` we just wanted an alias to more clearly specify the intent
export type ResourcesByNameOrId<TResource> = { [key: string]: TResource };

// Repositories provide a helpful abstraction around the Octopus Deploy API
export class BasicRepository<
    TExistingResource extends ResourceWithId,
    TNewResource, // Should never have a `Links` property, which we rely on in `save`
    TListArgs extends ListArgs & RouteArgs = ListArgs,
    TAllArgs extends AllArgs & RouteArgs = AllArgs,
    TGetArgs extends RouteArgs = {},
    TCreateArgs extends RouteArgs = {},
    TModifyArgs extends RouteArgs = {}
> {
    readonly takeAll = 2147483647;
    readonly takeDefaultPageSize = 30;
    protected client: Client;
    protected readonly collectionLinkName: GlobalAndSpaceRootLinks;
    private readonly subscribersToDataModifications: Dictionary<(data: TExistingResource) => void>;

    constructor(collectionLinkName: GlobalAndSpaceRootLinks, client: Client) {
        this.collectionLinkName = collectionLinkName;
        this.client = client;
        this.subscribersToDataModifications = {};
    }

    all(args?: TAllArgs): Promise<TExistingResource[]> {
        if (args !== undefined && args.ids instanceof Array && args.ids.length === 0) {
            return new Promise((res) => {
                res([]);
            });
        }

        // http.sys has a max query string of about 16k chars. Our typical max id length is 50 chars
        // so if we are doing requests by id and have more than 300, split into multiple requests
        const maxIds = 300;
        if (args !== undefined && args.ids instanceof Array && args.ids.length > maxIds) {
            return this.batchRequestsById(args, maxIds);
        }

        const allArgs = this.extend(args || {}, { id: "all" });

        return this.client.get(this.client.getLink(this.collectionLinkName), allArgs);
    }

    allById(args?: any): Promise<ResourcesById<TExistingResource>> {
        return this.all(args).then((result) =>
            result.reduce((acc: any, resource) => {
                acc[resource.Id] = resource;
                return acc;
            }, {})
        );
    }

    del(resource: TExistingResource) {
        return this.client.del(resource.Links.Self).then((d) => this.notifySubscribersToDataModifications(resource));
    }

    create(resource: TNewResource, args?: TCreateArgs): Promise<TExistingResource> {
        return this.client
            .create<TNewResource, TExistingResource>(this.client.getLink(this.collectionLinkName), resource, args!)
            .then((r) => this.notifySubscribersToDataModifications(r));
    }

    get(id: string, args?: TGetArgs): Promise<TExistingResource> {
        const allArgs = this.extend(args || {}, { id });
        return this.client.get(this.client.getLink(this.collectionLinkName), allArgs);
    }

    list(args?: TListArgs): Promise<ResourceCollection<TExistingResource>> {
        return this.client.get(this.client.getLink(this.collectionLinkName), args);
    }

    modify(resource: TExistingResource, args?: TModifyArgs): Promise<TExistingResource> {
        return this.client.update(resource.Links.Self, resource, args).then((r) => this.notifySubscribersToDataModifications(r));
    }

    save(resource: TExistingResource | TNewResource): Promise<TExistingResource> {
        if (isNewResource(resource)) {
            return this.create(resource);
        } else {
            return this.modify(resource);
        }

        function isTruthy<T>(value: T): boolean {
            return !!value;
        }

        function isNewResource(resource: TExistingResource | TNewResource): resource is TNewResource {
            return !("Id" in resource && isTruthy(resource.Id) && isTruthy(resource.Links));
        }
    }

    subscribeToDataModifications(key: string, callback: (data: TExistingResource) => void) {
        this.subscribersToDataModifications[key] = callback;
    }

    unsubscribeFromDataModifications(key: string) {
        delete this.subscribersToDataModifications[key];
    }

    protected extend(arg1: any, arg2: any) {
        return { ...arg1, ...arg2 };
    }

    protected notifySubscribersToDataModifications = (resource: TExistingResource): TExistingResource => {
        Object.keys(this.subscribersToDataModifications).forEach((key) => this.subscribersToDataModifications[key](resource));

        return resource;
    };

    protected batchRequestsById(args: TAllArgs, batchSize: number): Promise<TExistingResource[]> {
        const idArrays = chunk(args!.ids, batchSize);
        const promises: Array<Promise<TExistingResource[]>> = idArrays.map((ids) => {
            const newArgs = { ...(args as any), ids, id: "all" };
            return this.client.get(this.client.getLink(this.collectionLinkName), newArgs);
        });
        return Promise.all(promises).then((result) => flatten(result));
    }
}
