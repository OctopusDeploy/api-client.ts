export interface ResourceCollectionV2<TResource> {
    Items: TResource[];
    ItemsPerPage: number;
    ItemType: string;
    LastPageNumber: number;
    Links: LinksCollection<ResourceCollectionLinks>;
    NumberOfPages: number;
    TotalResults: number;
}

export interface ResourceCollectionLinks {
    Self: string;
    Template: string;
    "Page.All": string;
    "Page.Current": string;
    "Page.Last": string;
}

export type LinksCollection<T = {}> = T & {
    [Name: string]: string;
};
