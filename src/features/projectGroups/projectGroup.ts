import type { NamedResource } from "../../namedResource";
import { SpaceScopedResource } from "../../spaceScopedResource";

export interface ProjectGroup extends SpaceScopedResource, NamedResource {
    Description?: string;
}
