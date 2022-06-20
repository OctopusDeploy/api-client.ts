export interface Logger {
    info?: (message: string) => void;
    debug?: (message: string) => void;
    warn?: (message: string) => void;
    error?: (message: string, error: Error | undefined) => void;
}
