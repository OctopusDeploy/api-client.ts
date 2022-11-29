export enum RetentionUnit {
    Days = "Days",
    Items = "Items",
}

export interface RetentionPeriod {
    QuantityToKeep: number;
    ShouldKeepForever: boolean;
    Unit: RetentionUnit;
}
