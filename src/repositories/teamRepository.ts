/* eslint-disable @typescript-eslint/consistent-type-assertions */

import type { Client } from "../client";
import type { TeamResource, ScopedUserRoleResource, ResourceCollection } from "@octopusdeploy/message-contracts";
import MixedScopeBaseRepository from "./mixedScopeBaseRepository";
import type { ListArgs } from "./basicRepository";

interface TeamListArgs extends ListArgs {
    spaces?: string | string[];
    ids?: string | string[];
    includeSystem?: boolean;
    partialName: string;
}

class TeamRepository extends MixedScopeBaseRepository<TeamResource, TeamResource> {
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

export default TeamRepository;
