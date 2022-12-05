import type { IdentityType } from "./identityType";

export interface ClaimsBasedIdentity {
    Id: string; // to help in UI lists
    IdentityProviderName: string;
    Claims: {
        [key: string]: {
            Value?: string;
            IsIdentifyingClaim?: boolean;
        };
    };
}

export interface Identity {
    Provider: string;
    Type: IdentityType;
    IsExternal?: boolean;
    Id: string;
}

export interface ExternalIdentity extends Identity {
    IsExternal?: true;
    EmailAddress: string;
    IsNew?: boolean;
}

export interface OAuthIdentity extends ExternalIdentity {
    Type: IdentityType.OAuth;
}

export interface ActiveDirectoryIdentity extends ExternalIdentity {
    Type: IdentityType.ActiveDirectory;
    Upn?: string;
    SamAccountName?: string;
}
