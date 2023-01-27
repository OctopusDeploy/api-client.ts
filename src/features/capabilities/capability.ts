import { Client } from "../../client";
import { apiLocation } from "../../apiLocation";
import { OctopusError } from "../../octopusError";

interface CapabilitiesResponse {
    Capabilities: string[];
}

export async function checkForCapability(client: Client, capabilityName: string, minimumVersionThisWouldAppearIn: string): Promise<string | null> {
    try {
        const response = await client.get<CapabilitiesResponse>(`${apiLocation}/capabilities`);
        return response.Capabilities.filter((c) => c === capabilityName).length === 1
            ? null
            : `The Octopus instance does not support ${capabilityName}, it needs to be at least version ${minimumVersionThisWouldAppearIn} to get access to the feature you are trying to use.`;
    } catch (e) {
        if (e instanceof OctopusError) {
            if (e.StatusCode && e.StatusCode != 200) {
                return `The Octopus instance does not support the Capabilities API, you will need to upgrade it at least 2022.3 to get access to the feature you are trying to use.`;
            }
        }
        return `Unknown error occurred trying to determine if the Octopus instance supports ${capabilityName}.`;
    }
}
