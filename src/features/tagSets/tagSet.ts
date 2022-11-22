import type { NewTag, Tag } from "./tag";
import { NamedResourceV2, NewNamedResourceV2, NewSpaceScopedResourceV2, SpaceScopedResourceV2 } from "../..";

export interface TagSet extends SpaceScopedResourceV2, NamedResourceV2 {
    Description?: string;
    SortOrder: number;
    Tags: Tag[];
}

export interface NewTagSet extends NewSpaceScopedResourceV2, NewNamedResourceV2 {
    Tags: NewTag[];
    Description?: string;
    SortOrder?: number;
}
