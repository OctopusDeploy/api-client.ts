import type { ClientResponseDetails } from "./clientResponseDetails";

export interface ClientErrorResponseDetails extends ClientResponseDetails {
    errorMessage: string;
    errors?: string[];
}
