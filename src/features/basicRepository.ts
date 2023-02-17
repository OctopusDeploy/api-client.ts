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
    static TakeAll = 2147483647;
    readonly takeDefaultPageSize = 30;
    protected client: Client;
    protected readonly baseApiPathTemplate: string;
    private readonly listParametersTemplate: string;
    private readonly subscribersToDataModifications: Dictionary<(data: TExistingResource) => void>;

    constructor(client: Client, baseApiPathTemplate: string, listParametersTemplate: string) {
        this.client = client;
        this.baseApiPathTemplate = baseApiPathTemplate;
        this.listParametersTemplate = listParametersTemplate;
        this.subscribersToDataModifications = {};
    }

    del(resource: TExistingResource) {
        return this.client.del(`${this.baseApiPathTemplate}/${resource.Id}`).then((d) => this.notifySubscribersToDataModifications(resource));
    }

    create(resource: TNewResource, args?: TCreateArgs): Promise<TExistingResource> {
        return this.client.doCreate<TExistingResource>(this.baseApiPathTemplate, resource, args).then((r) => this.notifySubscribersToDataModifications(r));
    }

    get(id: string): Promise<TExistingResource> {
        return this.client.get(`${this.baseApiPathTemplate}/${id}`);
    }

    list(args?: TListArgs): Promise<ResourceCollection<TExistingResource>> {
        return this.client.request(`${this.baseApiPathTemplate}{?${this.listParametersTemplate}}`, args);
    }

    modify(resource: TExistingResource, args?: TModifyArgs): Promise<TExistingResource> {
        return this.client
            .doUpdate<TExistingResource>(`${this.baseApiPathTemplate}/${resource.Id}`, resource, args)
            .then((r) => this.notifySubscribersToDataModifications(r));
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
