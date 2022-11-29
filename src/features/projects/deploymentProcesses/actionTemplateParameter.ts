import { PropertyValue } from "../../..";
import { Resource } from "../../resource";
import type { ActionTemplateParameterDisplaySettings } from "./actionTemplateParameterDisplaySettings";

export interface ActionTemplateParameter extends Resource {
    AllowClear?: boolean;
    DefaultValue?: PropertyValue;
    DisplaySettings: ActionTemplateParameterDisplaySettings;
    HelpText: string;
    Label: string;
    Name: string;
}
