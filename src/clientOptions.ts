import type { ClientErrorResponseDetails } from "./clientErrorResponseDetails";
import type { ClientRequestDetails } from "./clientRequestDetails";
import type { ClientResponseDetails } from "./clientResponseDetails";
import type { ClientConfiguration } from "./clientConfiguration";
import type { ClientSession } from "./clientSession";
import type { OctopusError } from "@octopusdeploy/message-contracts";
import type { ServerInformation } from "./serverInformation";

export interface ClientOptions {
  configuration: ClientConfiguration;
  session: ClientSession | null;
  url: string;
  method?: string;
  success: (data: PromiseLike<string> | string) => void;
  error: (error: OctopusError) => void;
  raw?: boolean;
  requestBody?: string;
  nonStale?: boolean;
  tryGetServerInformation: () => ServerInformation | null;
  getAntiForgeryTokenCallback: () => string | null;
  onRequestCallback: (details: ClientRequestDetails) => void;
  onResponseCallback: (details: ClientResponseDetails) => void;
  onErrorResponseCallback: (details: ClientErrorResponseDetails) => void;
}
