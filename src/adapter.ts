import type { ClientOptions } from "./clientOptions";

export interface Adapter<TResource> {
    execute: (options: ClientOptions) => Promise<AdapterResponse<TResource>>;
}

export interface AdapterResponse<TResource> {
    statusCode: number;
    data: TResource;
}

export class AdapterError {
    public readonly code: number;
    public readonly message: string;

    constructor(code: number, message: string) {
        this.code = code;
        this.message = message;
    }
}
