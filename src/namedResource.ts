import { NewResource, Resource } from "./resource";

export interface NamedResource extends Resource {
    Name: string;
}

export interface NewNamedResource extends NewResource {
    Name: string;
}
