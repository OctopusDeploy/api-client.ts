import { NamedResource } from "../../namedResource";
import { SpaceScopedResource } from "../../spaceScopedResource";
import type { Phase } from "./phase";
import type { RetentionPeriod } from "./retentionPeriod";

export interface Lifecycle extends SpaceScopedResource, NamedResource {
    Description?: string;
    Phases: Phase[];
    ReleaseRetentionPolicy: RetentionPeriod;
    TentacleRetentionPolicy: RetentionPeriod;
}
