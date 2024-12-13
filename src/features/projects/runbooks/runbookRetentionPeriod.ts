export interface RunbookRetentionPeriod {
    QuantityToKeep: number;
    ShouldKeepForever: boolean;
    Unit: Unit;
}

export enum Unit {
    days = "Days",
    items = "Items",
}
