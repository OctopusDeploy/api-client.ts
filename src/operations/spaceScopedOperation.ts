// A SpaceScopedOperation is like a SpaceScopedCommand, except references things by name rather than Id
export interface SpaceScopedOperation {
    spaceName: string;
}

export function isSpaceScopedOperation(command: any): command is SpaceScopedOperation {
    return "spaceName" in command;
}
