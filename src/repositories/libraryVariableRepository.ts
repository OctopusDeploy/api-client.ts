import type {
    LibraryVariableSetUsageResource,
    LibraryVariableSetResource,
    NewLibraryVariableSetResource,
    VariableSetContentType
} from "@octopusdeploy/message-contracts";
import type { AllArgs, ListArgs } from "./basicRepository";
import { BasicRepository } from "./basicRepository";
import type { Client } from "../client";

type LibraryVariableAllArgs = {
    contentType?: VariableSetContentType;
} & AllArgs;

type LibraryVariableListArgs = {
    contentType?: VariableSetContentType;
} & ListArgs;

export class LibraryVariableRepository extends BasicRepository<LibraryVariableSetResource, NewLibraryVariableSetResource, LibraryVariableListArgs, LibraryVariableAllArgs> {
    constructor(client: Client) {
        super("LibraryVariables", client);
    }

    getUsages(libraryVariableSet: LibraryVariableSetResource): Promise<LibraryVariableSetUsageResource> {
        return this.client.get(libraryVariableSet.Links["Usages"]);
    }
}