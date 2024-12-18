import { RetentionUnit } from "../../..";

export interface RunbookRetentionPeriod {
    QuantityToKeep: number;
    ShouldKeepForever: boolean;
    Unit?: RunbookRetentionUnit;
}

export enum RunbookRetentionUnit {
    Days = "Days",
    Items = "Items",
}
