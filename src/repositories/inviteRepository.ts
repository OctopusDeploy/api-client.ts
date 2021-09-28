import type { InvitationResource } from "@octopusdeploy/message-contracts";
import type { Client } from "../client";
import { MixedScopeBaseRepository } from "./mixedScopeBaseRepository";

export class InvitationRepository extends MixedScopeBaseRepository<InvitationResource, InvitationResource> {
    constructor(client: Client) {
        super("Invitations", client);
    }

    invite(teamIds: string[], spaceId: string | null): Promise<InvitationResource> {
        return this.client.post(this.client.getLink("Invitations"), { AddToTeamIds: teamIds, SpaceId: spaceId });
    }
}