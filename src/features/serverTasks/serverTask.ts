import { NamedResourceV2 } from "../../features";
import { TaskState } from "./taskState";

export interface ServerTask extends NamedResourceV2 {
  description: string;
  state: TaskState;
  completed?: string;
  queueTime?: string;
  queueTimeExpiry?: string;
  startTime?: string | null;
  lastUpdatedTime?: string;
  completedTime?: string | null;
  serverNode?: string;
  duration?: string;
  errorMessage?: string;
  hasBeenPickedUpByProcessor?: boolean;
  isCompleted: boolean;
  finishedSuccessfully?: boolean;
  hasPendingInterruptions: boolean;
  canRerun?: boolean;
  hasWarningsOrErrors: boolean;
}
