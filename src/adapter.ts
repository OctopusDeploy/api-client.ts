import type { ClientOptions } from "./clientOptions";

export interface Adapter<TResource> {
    execute: (options: ClientOptions) => Promise<TResource & AdapterResponse>;

}

export interface AdapterResponse {
    statusCode: number;
}

export class AdapterError {
    public readonly code: number;
    public readonly message: string;

    constructor(code: number, message: string) {
        this.code = code;
        this.message = message;
    }
}

