/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-explicit-any */

// Octopus prefix is used here as there is already a built-in type called Error
export class OctopusError extends Error {
    static create(statusCode: number, response: any): OctopusError {
        const e = new OctopusError(statusCode);
        const n = { ...e, ...response };

        Object.setPrototypeOf(n, OctopusError.prototype);
        return n;
    }

    FullException?: string;
    Errors?: string[];
    ParsedHelpLinks?: string[];
    HelpText?: string;
    HelpLink?: string;
    Details?: {
        [key: string]: string;
    };
    ErrorMessage: string;

    constructor(readonly StatusCode: number, message?: string) {
        super(message);
        this.ErrorMessage = message!;
        this.Errors = [];

        Object.setPrototypeOf(this, OctopusError.prototype);
    }
}
