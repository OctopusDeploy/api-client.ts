import { NewResourceV2, ResourceV2 } from "..";

export interface SpaceScopedResourceV2 extends ResourceV2 {
    SpaceId: string;
}

export interface NewSpaceScopedResourceV2 extends NewResourceV2 {}

export function isSpaceScopedResource(resource: any): resource is SpaceScopedResourceV2 {
    return "SpaceId" in resource;
}
