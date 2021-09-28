import type { ArtifactResource } from "@octopusdeploy/message-contracts";
import { BasicRepository } from "./basicRepository";
import type { Client } from "../client";
import type { ListArgs } from "./basicRepository";

export type ArtifactListArgs = {
    order?: string;
    regarding?: string;
} & ListArgs;

export class ArtifactRepository extends BasicRepository<ArtifactResource, ArtifactResource, ArtifactListArgs> {
    constructor(client: Client) {
        super("Artifacts", client);
    }
}