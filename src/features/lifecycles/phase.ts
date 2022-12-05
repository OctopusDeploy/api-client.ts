import { NamedResource } from "../../namedResource";
import type { RetentionPeriod } from "./retentionPeriod";

export type Phase = PhasedResource & {
    ReleaseRetentionPolicy?: RetentionPeriod;
    TentacleRetentionPolicy?: RetentionPeriod;
};

export interface PhasedResource extends NamedResource {
    IsOptionalPhase: boolean;
    MinimumEnvironmentsBeforePromotion: number;
    OptionalDeploymentTargets?: string[];
    AutomaticDeploymentTargets?: string[];
}
