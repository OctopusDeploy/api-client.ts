export interface PackageReference<T = PackageReferenceProperties> {
    Name?: string;
    PackageId: string;
    FeedId: string;
    AcquisitionLocation: string;
    Properties: T;
    Id: string;
}

export type PackageReferenceProperties = Record<string, string>;

export enum PackageSelectionMode {
    Immediate = "immediate",
    Deferred = "deferred",
}
