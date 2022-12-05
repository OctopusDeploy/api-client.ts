import { Resource } from "../../resource";
import { ClaimsBasedIdentity } from "./identity";

export interface User extends Resource {
    DisplayName: string;
    Username: string;
    IsActive: boolean;
    IsService: boolean;
    EmailAddress?: string;
    Password?: string;
    Identities: ClaimsBasedIdentity[];
}

export interface UserProjection extends User {
    CanPasswordBeEdited?: boolean;
    IsRequestor?: boolean;
}
