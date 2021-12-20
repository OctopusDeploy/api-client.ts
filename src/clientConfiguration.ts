import { Agent } from "https";

export interface ClientConfiguration {
  agent?: Agent;
  apiKey: string;
  apiUri: string;
  autoConnect?: boolean;
  space?: string;
  logging?: Logger
}

export interface Logger {
  info?: (message: string) => void;
  debug?: (message: string) => void;
  warn?: (message: string) => void;
  error?: (message: string, error: Error | undefined) => void
}
