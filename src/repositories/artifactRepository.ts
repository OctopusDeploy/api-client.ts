import type { ArtifactResource } from "@octopusdeploy/message-contracts";
import BasicRepository from "./basicRepository";
import type { Client } from "../client";
import type { ListArgs } from "./basicRepository";

type ArtifactListArgs = {
    regarding?: string;
    order?: string;
} & ListArgs;

class ArtifactRepository extends BasicRepository<ArtifactResource, ArtifactResource, ArtifactListArgs> {
    constructor(client: Client) {
        super("Artifacts", client);
    }
}

export default ArtifactRepository;
