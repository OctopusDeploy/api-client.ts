import type { ResourceCollection, ResourceWithId } from "@octopusdeploy/message-contracts";
import type { Dictionary } from "lodash";
import { chunk, flatten } from "lodash";
import type { Client } from "../client";
import type { RouteArgs } from "../resolver";

export type ListArgsV2 = {
    skip?: number;
    take?: number;
};

export type AllArgsV2 = {
    ids?: string[];
};

export type ResourcesByIdV2<TResource> = { [id: string]: TResource };

//Although this is exactly the same as `ResourcesById` we just wanted an alias to more clearly specify the intent
export type ResourcesByNameOrIdV2<TResource> = { [key: string]: TResource };

// Repositories provide a helpful abstraction around the Octopus Deploy API
export class BasicRepositoryV2<
    TExistingResource extends ResourceWithId,
    TNewResource,
    TListArgs extends ListArgsV2 & RouteArgs = ListArgsV2,
    TAllArgs extends AllArgsV2 & RouteArgs = AllArgsV2,
    TGetArgs extends RouteArgs = {},
    TCreateArgs extends RouteArgs = {},
    TModifyArgs extends RouteArgs = {}
> {
    readonly takeAll = 2147483647;
    readonly takeDefaultPageSize = 30;
    protected client: Client;
    protected readonly baseApiTemplate: string;
    private readonly subscribersToDataModifications: Dictionary<(data: TExistingResource) => void>;

    constructor(client: Client, baseApiRoute: string) {
        this.client = client;
        this.baseApiTemplate = baseApiRoute;
        this.subscribersToDataModifications = {};
    }

    del(resource: TExistingResource) {
        return this.client.del(`${this.baseApiTemplate}/${resource.Id}`).then((d) => this.notifySubscribersToDataModifications(resource));
    }

    create(resource: TNewResource, args?: TCreateArgs): Promise<TExistingResource> {
        return this.client
            .create<TNewResource, TExistingResource>(this.baseApiTemplate, resource, args!)
            .then((r) => this.notifySubscribersToDataModifications(r));
    }

    get(id: string, args?: TGetArgs): Promise<TExistingResource> {
        const allArgs = this.extend(args || {}, { id });
        return this.client.get(this.baseApiTemplate, allArgs);
    }

    list(args?: TListArgs): Promise<ResourceCollection<TExistingResource>> {
        return this.client.get(this.baseApiTemplate, args);
    }

    modify(resource: TExistingResource, args?: TModifyArgs): Promise<TExistingResource> {
        return this.client.update(this.baseApiTemplate, resource, args).then((r) => this.notifySubscribersToDataModifications(r));
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

    protected batchRequestsById(args: TAllArgs, batchSize: number): Promise<TExistingResource[]> {
        const idArrays = chunk(args!.ids, batchSize);
        const promises: Array<Promise<TExistingResource[]>> = idArrays.map((ids) => {
            const newArgs = { ...(args as any), ids, id: "all" };
            return this.client.get(this.baseApiTemplate, newArgs);
        });
        return Promise.all(promises).then((result) => flatten(result));
    }
}
