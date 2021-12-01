import type { ClientOptions } from "./clientOptions";

export interface Adapter<TResource> {
    execute: (options: ClientOptions) => Promise<TResource & AdapterResponse>;

}

export interface AdapterResponse {
    statusCode: number;
}

export class AdapterError {
    public readonly code: string;
    public readonly message: string;

    constructor(code: string, message: string) {
        this.code = code;
        this.message = message;
    }
}

