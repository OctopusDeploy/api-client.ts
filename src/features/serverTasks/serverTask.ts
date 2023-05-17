import { NamedResource } from "../../namedResource";
import { TaskState } from "./taskState";

export interface ServerTask<TArguments = any> extends NamedResource {
    Description: string;
    State: TaskState;
    Completed?: string;
    QueueTime?: string;
    QueueTimeExpiry?: string;
    StartTime?: string | null;
    LastUpdatedTime?: string;
    CompletedTime?: string | null;
    ServerNode?: string;
    Duration?: string;
    ErrorMessage?: string;
    HasBeenPickedUpByProcessor?: boolean;
    IsCompleted: boolean;
    FinishedSuccessfully?: boolean;
    HasPendingInterruptions: boolean;
    CanRerun?: boolean;
    HasWarningsOrErrors: boolean;
    Arguments: TArguments;
}
