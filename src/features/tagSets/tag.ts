export interface Tag {
    Id: string;
    Name: string;
    Color: string;
    Description: string;
    SortOrder: number;
    CanonicalTagName: string;
}

export interface NewTag {
    Name: string;
    Color: string;
    Description?: string;
    SortOrder?: number;
}
