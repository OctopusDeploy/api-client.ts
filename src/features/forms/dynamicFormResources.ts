export interface MetadataTypeCollection {
    Description: string;
    Types: TypeMetadata[];
}

export interface TypeMetadata {
    Name: string;
    Properties: PropertyMetadata[];
}

export interface PropertyMetadata {
    Name: string;
    Type: string;
    DisplayInfo: DisplayInfo;
}

export interface DisplayInfo {
    Required: boolean;
    Sensitive: boolean;
    Label: string;
    Description: string;
    //eslint-disable-next-line @typescript-eslint/no-explicit-any
    Options: any;
    ListApi: string;
    ReadOnly: boolean;
    ShowCopyToClipboard: boolean;
    PropertyApplicability?: PropertyApplicability;
    ConnectivityCheck?: ConnectivityCheck;
}

export enum PropertyApplicabilityMode {
    ApplicableIfHasAnyValue = "ApplicableIfHasAnyValue",
    ApplicableIfHasNoValue = "ApplicableIfHasNoValue",
    ApplicableIfSpecificValue = "ApplicableIfSpecificValue",
    ApplicableIfNotSpecificValue = "ApplicableIfNotSpecificValue",
}

export interface PropertyApplicability {
    Mode: PropertyApplicabilityMode;
    DependsOnPropertyName: string;
    //eslint-disable-next-line @typescript-eslint/no-explicit-any
    DependsOnPropertyValue: any;
}

export interface ConnectivityCheck {
    Title: string;
    Url: string;
    DependsOnPropertyNames: string[];
}

export enum ConnectivityCheckResponseMessageCategory {
    Info = "Info",
    Warning = "Warning",
    Error = "Error",
}

export interface ConnectivityCheckResponseMessage {
    Category: ConnectivityCheckResponseMessageCategory;
    Message: string;
}

export interface ConnectivityCheckResponse {
    Messages: ConnectivityCheckResponseMessage[];
}

//eslint-disable-next-line @typescript-eslint/no-explicit-any
export type DataContext = Record<string, any>;
