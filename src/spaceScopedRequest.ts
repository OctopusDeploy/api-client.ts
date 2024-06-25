// A SpaceScopedRequest is like a SpaceScopedCommand, except references things by name rather than Id
export interface SpaceScopedRequest {
    spaceName: string;
}

export function isSpaceScopedRequest(command: any): command is SpaceScopedRequest {
    return command && "spaceName" in command;
}
