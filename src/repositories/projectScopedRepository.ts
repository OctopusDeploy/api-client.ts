/* eslint-disable @typescript-eslint/no-non-null-assertion,jsdoc/require-param */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/consistent-type-assertions */

import type { ProjectResource, ResourceCollection, ResourceWithId } from "@octopusdeploy/message-contracts";
import { PersistenceSettingsType } from "@octopusdeploy/message-contracts";
import type { GlobalAndSpaceRootLinks } from "../client";
import type { Client } from "../client";
import type { RouteArgs } from "../resolver";
import type { AllArgs, ListArgs } from "./basicRepository";
import BasicRepository from "./basicRepository";
import type ProjectRepository from "./projectRepository";
import { chunk, flatten } from "lodash";

interface HasProject {
    ProjectId: string;
}

// Repositories provide a helpful abstraction around the Octopus Deploy API
class ProjectScopedRepository<
    TExistingResource extends ResourceWithId,
    TNewResource extends HasProject, // Should never have a `Links` property, which we rely on in `save`
    TListArgs extends ListArgs & RouteArgs = ListArgs,
    TAllArgs extends AllArgs & RouteArgs = AllArgs,
    TGetArgs extends RouteArgs = {},
    TCreateArgs extends RouteArgs = {},
    TModifyArgs extends RouteArgs = {}
    > extends BasicRepository<TExistingResource, TNewResource, TListArgs, TAllArgs, TGetArgs, TCreateArgs, TModifyArgs> {
    readonly takeAll = 2147483647;
    protected projectRepository: ProjectRepository;

    constructor(projectRepository: ProjectRepository, collectionLinkName: GlobalAndSpaceRootLinks, client: Client) {
        super(collectionLinkName, client);
        this.projectRepository = projectRepository;
    }

    create(resource: TNewResource, args?: TCreateArgs): Promise<TExistingResource> {
        // Need to separate this out because it's either called immediately, or
        const createInternal = (projectResource: ProjectResource, resource: TNewResource, args?: TCreateArgs): Promise<TExistingResource> => {
            // For now, we only want to use the project scoped endpoint for version controlled projects
            // Database projects should remain as they were
            if (projectResource.PersistenceSettings.Type == PersistenceSettingsType.VersionControlled) {
                return this.createForProject(projectResource, resource, args);
            }

            return super.create(resource, args);
        };

        return this.projectRepository.get(resource.ProjectId).then((proj) => createInternal(proj, resource, args));
    }

    createForProject(projectResource: ProjectResource, resource: TNewResource, args?: TCreateArgs): Promise<TExistingResource> {
        const link = projectResource.Links[this.collectionLinkName];
        return this.client.create<TNewResource, TExistingResource>(link, resource, args!).then((r) => this.notifySubscribersToDataModifications(r));
    }

    listFromProject(projectResource: ProjectResource, args?: TListArgs): Promise<ResourceCollection<TExistingResource>> {
        const link = projectResource.Links[this.collectionLinkName];
        return this.client.get(link, args);
    }

    getFromProject(projectResource: ProjectResource, id: string, args?: TGetArgs): Promise<TExistingResource> {
        if (projectResource.PersistenceSettings.Type == PersistenceSettingsType.VersionControlled) {
            const allArgs = this.extend(args || {}, { id });
            const link = projectResource.Links[this.collectionLinkName];
            return this.client.get(link, allArgs);
        }

        return super.get(id, args);
    }

    allFromProject(projectResource: ProjectResource, args?: TAllArgs): Promise<TExistingResource[]> {
        if (args !== undefined && args.ids instanceof Array && args.ids.length === 0) {
            return new Promise((res) => {
                res([]);
            });
        }

        // http.sys has a max query string of about 16k chars. Our typical max id length is 50 chars
        // so if we are doing requests by id and have more than 300, split into multiple requests
        const maxIds = 300;
        if (args !== undefined && args.ids instanceof Array && args.ids.length > maxIds) {
            return this.batchRequestsByIdForProject(projectResource, args, maxIds);
        }

        const allArgs = this.extend(args || {}, { take: this.takeAll });

        const link = projectResource.Links[this.collectionLinkName];
        return this.client.get(link, allArgs).then((res) => (res as ResourceCollection<TExistingResource>).Items);
    }

    saveToProject(projectResource: ProjectResource, resource: TExistingResource | TNewResource, args?: TModifyArgs | TCreateArgs | undefined): Promise<TExistingResource> {
        if (isNewResource(resource)) {
            return this.createForProject(projectResource, resource as TNewResource, args as TCreateArgs | undefined);
        } else {
            //We need the cast here, since there is a bug in typescript where things don't narrow appropriately for generics https://github.com/microsoft/TypeScript/issues/44404
            //The usual workaround of inverting the checks doesn't seem to work here unfortunately so there is no way to avoid the cast until the bug is fixed.
            return this.modify(resource as TExistingResource, args as TModifyArgs | undefined);
        }

        function isTruthy<T>(value: T): boolean {
            return !!value;
        }

        function isNewResource(resource: TExistingResource | TNewResource): resource is TNewResource {
            return !("Id" in resource && isTruthy(resource.Id) && isTruthy(resource.Links));
        }
    }

    protected batchRequestsByIdForProject(projectResource: ProjectResource, args: TAllArgs, batchSize: number): Promise<TExistingResource[]> {
        const idArrays = chunk(args!.ids, batchSize);
        const promises: Array<Promise<TExistingResource[]>> = idArrays.map((ids) => {
            const newArgs = { ...(args as any), ids };
            const link = projectResource.Links[this.collectionLinkName];
            return this.client.get(link, newArgs);
        });
        return Promise.all(promises).then((result) => flatten(result));
    }
}

export default ProjectScopedRepository;
