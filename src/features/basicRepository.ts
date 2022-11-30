import type { Dictionary } from "lodash";
import type { Client } from "../client";
import type { RouteArgs } from "../resolver";
import { ResourceCollection } from "../resourceCollection";
import { NewResource, Resource } from "../resource";

export type ListArgs = {
    skip?: number;
    take?: number;
};

export type ResourcesById<TResource> = { [Id: string]: TResource };

//Although this is exactly the same as `ResourcesById` we just wanted an alias to more clearly specify the intent
export type ResourcesByNameOrId<TResource> = { [Key: string]: TResource };

// Repositories provide a helpful abstraction around the Octopus Deploy API
export class BasicRepository<
    TExistingResource extends Resource,
    TNewResource extends NewResource,
    TListArgs extends ListArgs & RouteArgs = ListArgs,
    TCreateArgs extends RouteArgs = RouteArgs,
    TModifyArgs extends RouteArgs = RouteArgs
> {
    readonly takeAll = 2147483647;
    readonly takeDefaultPageSize = 30;
    protected client: Client;
    protected readonly baseApiTemplate: string;
    private readonly subscribersToDataModifications: Dictionary<(data: TExistingResource) => void>;

    constructor(client: Client, baseApiTemplate: string) {
        this.client = client;
        this.baseApiTemplate = baseApiTemplate;
        this.subscribersToDataModifications = {};
    }

    del(resource: TExistingResource) {
        return this.client.del(`${this.baseApiTemplate}/${resource.Id}`).then((d) => this.notifySubscribersToDataModifications(resource));
    }

    async create(resource: TNewResource, args?: TCreateArgs): Promise<TExistingResource> {
        return await this.client.doCreate<TExistingResource>(this.baseApiTemplate, resource, args).then((r) => this.notifySubscribersToDataModifications(r));
    }

    async get(id: string): Promise<TExistingResource> {
        return await this.client.get(this.baseApiTemplate, { id });
    }

    async list(args?: TListArgs): Promise<ResourceCollection<TExistingResource>> {
        return await this.client.get(this.baseApiTemplate, args);
    }

    async modify(resource: TExistingResource, args?: TModifyArgs): Promise<TExistingResource> {
        return await this.client
            .doUpdate<TExistingResource>(this.baseApiTemplate, resource, { id: resource.Id, ...args })
            .then((r) => this.notifySubscribersToDataModifications(r));
    }

    async save(resource: TExistingResource | TNewResource): Promise<TExistingResource> {
        if (isNewResource(resource)) {
            return await this.create(resource);
        } else {
            return await this.modify(resource);
        }

        function isTruthy<T>(value: T): boolean {
            return !!value;
        }

        function isNewResource(resource: TExistingResource | TNewResource): resource is TNewResource {
            return !("Id" in resource && isTruthy(resource.Id));
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
}
