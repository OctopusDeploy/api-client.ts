import { NewNamedResource, NamedResource } from "../../namedResource";

export interface Space extends NamedResource {
    Slug: string;
    Description?: string;
    IsDefault: boolean;
    SpaceManagersTeamMembers: string[];
    SpaceManagersTeams: string[];
    TaskQueueStopped: boolean;
}

export interface NewSpace extends NewNamedResource {
    Slug?: string;
    Description?: string;
    IsDefault: boolean;
    SpaceManagersTeams: string[];
    SpaceManagersTeamMembers: string[];
}
