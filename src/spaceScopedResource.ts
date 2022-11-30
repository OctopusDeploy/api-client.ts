import { NewResource, Resource } from "./resource";

export interface SpaceScopedResource extends Resource {
    SpaceId: string;
}

export type NewSpaceScopedResource = NewResource;

export function isSpaceScopedResource(resource: any): resource is SpaceScopedResource {
    return "SpaceId" in resource;
}
