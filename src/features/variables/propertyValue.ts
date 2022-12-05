export type PropertyValue = string | SensitiveValue | null;

export interface SensitiveValue {
    HasValue: boolean;
    Hint?: string;
    // NewValue can also be null at runtime
    NewValue?: string;
}

export function NewSensitiveValue(value: string, hint?: string): SensitiveValue {
    return {
        HasValue: true,
        Hint: hint,
        NewValue: value,
    };
}

export function isSensitiveValue(value: PropertyValue): value is SensitiveValue {
    if (typeof value === "string" || value === null) {
        return false;
    }

    return Object.prototype.hasOwnProperty.call(value, "HasValue");
}
