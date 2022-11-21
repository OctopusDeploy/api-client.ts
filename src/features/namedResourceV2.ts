import { NewResourceV2, ResourceV2 } from "..";

export interface NamedResourceV2 extends ResourceV2 {
    Name: string;
}

export interface NewNamedResourceV2 extends NewResourceV2 {
    Name: string;
}
