export type PropertyValue = string | SensitiveValue | null;

export interface SensitiveValue {
  hasValue: boolean;
  hint?: string;
  // NewValue can also be null at runtime
  newValue?: string;
}

export function NewSensitiveValue(
  value: string,
  hint?: string
): SensitiveValue {
  return {
    hasValue: true,
    hint: hint,
    newValue: value,
  };
}

export function isSensitiveValue(
  value: PropertyValue
): value is SensitiveValue {
  if (typeof value === "string" || value === null) {
    return false;
  }

  return Object.prototype.hasOwnProperty.call(value, "hasValue");
}
