export interface SpaceScopedArgs {
    spaceName: string;
}

export function isSpaceScopedArgs(args: any): args is SpaceScopedArgs {
    return "spaceName" in args;
}
