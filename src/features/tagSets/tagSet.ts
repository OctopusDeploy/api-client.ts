import type { NewTag, Tag } from "./tag";
import { NamedResource, NewNamedResource, NewSpaceScopedResource, SpaceScopedResource } from "../..";

export interface TagSet extends SpaceScopedResource, NamedResource {
    Description?: string;
    SortOrder: number;
    Tags: Tag[];
}

export interface NewTagSet extends NewSpaceScopedResource, NewNamedResource {
    Tags: NewTag[];
    Description?: string;
    SortOrder?: number;
}
