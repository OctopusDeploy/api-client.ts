/* eslint-disable @typescript-eslint/no-non-null-assertion */
import type { ResourceWithId } from "@octopusdeploy/message-contracts";
import type { Client } from "../client";

export function uploadLogo<T extends ResourceWithId>(client: Client, resource: T, logo: File) {
    const fd = new FormData();
    fd.append("fileToUpload", logo);
    return client.post(resource.Links["Logo"], fd);
}

export async function saveLogo<T extends ResourceWithId>(client: Client, resource: T, file: File | undefined, reset: boolean) {
    // Important: when using saveLogo
    // We upload the logo first so that when we do the model save we get back a new url for logo
    if (file) {
        return uploadLogo(client, resource, file);
    } else if (reset) {
        return uploadLogo(client, resource, null!);
    }
}
