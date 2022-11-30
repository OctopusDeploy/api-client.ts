export interface Resource {
    Id: string;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface NewResource {}

export function isResource(resource: any): resource is Resource {
    return "Id" in resource;
}
