import { NamedResource, NewNamedResource } from "../../../namedResource";
import { NewSpaceScopedResource, SpaceScopedResource } from "../../../spaceScopedResource";

export interface RunbookSnapshot extends SpaceScopedResource, NamedResource {
    ProjectId: string;
    RunbookId: string;
    Notes?: string;
    FrozenRunbookProcessId: string;
    FrozenProjectVariableSetId: string;
}

export interface NewRunbookSnapshot extends NewSpaceScopedResource, NewNamedResource {
    ProjectId: string;
    RunbookId: string;
    Notes?: string;
    Publish?: string | undefined;
}
