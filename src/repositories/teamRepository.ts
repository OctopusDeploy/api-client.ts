import type { TeamResource, ScopedUserRoleResource, ResourceCollection } from "@octopusdeploy/message-contracts";
import type { Client } from "../client";
import type { ListArgs } from "./basicRepository";
import { MixedScopeBaseRepository } from "./mixedScopeBaseRepository";

interface TeamListArgs extends ListArgs {
    spaces?: string | string[];
    ids?: string | string[];
    includeSystem?: boolean;
    partialName: string;
}

export class TeamRepository extends MixedScopeBaseRepository<TeamResource, TeamResource> {
    constructor(client: Client) {
        super("Teams", client);
    }

    listScopedUserRoles(team: TeamResource): Promise<ResourceCollection<ScopedUserRoleResource>> {
        return this.client.get(team.Links["ScopedUserRoles"], this.spacePartitionParameters());
    }

    list(args?: TeamListArgs): Promise<ResourceCollection<TeamResource>> {
        return super.list(args) as Promise<ResourceCollection<TeamResource>>;
    }
}