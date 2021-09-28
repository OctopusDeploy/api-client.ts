import type { Client } from "../client";
import type { UserResource, TeamMembership, TeamResource } from "@octopusdeploy/message-contracts";
import { convertToSpacePartitionParameters } from "./mixedScopeBaseRepository";

class TeamMembershipRepository {
    private client: Client;
    constructor(client: Client) {
        this.client = client;
    }

    getForUser(user: UserResource, includeSystem: boolean) {
        return this.client.get<TeamMembership[]>(this.client.getLink("TeamMembership"), { userId: user.Id, ...convertToSpacePartitionParameters(this.client.spaceId, includeSystem) });
    }

    previewTeam(team: TeamResource): Promise<TeamMembership[]> {
        return this.client.post(this.client.getLink("TeamMembershipPreviewTeam"), team);
    }
}

export default TeamMembershipRepository;
