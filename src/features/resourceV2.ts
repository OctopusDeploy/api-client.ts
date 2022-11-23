export interface ResourceV2 {
    Id: string;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface NewResourceV2 {}

export function isResource(resource: any): resource is ResourceV2 {
    return "Id" in resource;
}
