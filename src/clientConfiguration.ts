import { Agent } from "https";

export interface ClientConfiguration {
  agent?: Agent;
  apiKey?: string;
  apiUri?: string;
  autoConnect?: boolean;
  serverEndpoint?: string;
  space?: string;
}
