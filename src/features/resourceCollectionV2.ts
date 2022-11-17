export interface ResourceCollectionV2<TResource> {
    items: TResource[];
    itemsPerPage: number;
    itemType: string;
    lastPageNumber: number;
    links: LinksCollection<ResourceCollectionLinks>;
    numberOfPages: number;
    totalResults: number;
  }

  export interface ResourceCollectionLinks {
    self: string;
    template: string;
    "page.All": string;
    "page.Current": string;
    "page.Last": string;
  }

  export type LinksCollection<T = {}> = T & {
    [name: string]: string;
  };