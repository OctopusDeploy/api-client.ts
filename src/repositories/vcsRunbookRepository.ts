import type {
    ModifyRunbookCommand,
    NewVcsRunbookResource,
    ProjectResource,
    ResourceCollection,
    VcsBranchResource,
    VcsRunbookResource
} from "@octopusdeploy/message-contracts";
import type { Client } from "../client";

class VcsRunbookRepository {
    constructor(private readonly client: Client, private readonly project: ProjectResource, private readonly branch: VcsBranchResource | undefined) {
        this.client = client;
    }

    private getBranch() {
        if (!this.branch) throw new Error("Can't use VCS Runbook Repository unless there is a branch available in the VCS Project");
        return this.branch;
    }

    // TODO: @team-config-as-code create and pass in a command instead of the reasource
    create(newVcsRunbook: NewVcsRunbookResource): Promise<VcsRunbookResource> {
        return this.client.create(this.getBranch().Links.Runbook, newVcsRunbook, {});
    }
    get(id: string): Promise<VcsRunbookResource> {
        return this.client.get(this.getBranch().Links.Runbook, { id });
    }
    list(args?: { skip?: number; take?: number }): Promise<ResourceCollection<VcsRunbookResource>> {
        return this.client.get<ResourceCollection<VcsRunbookResource>>(this.getBranch().Links.Runbook, args);
    }
    modify(vcsRunbook: ModifyRunbookCommand): Promise<VcsRunbookResource> {
        return this.client.update(vcsRunbook.Links.Self, vcsRunbook);
    }
    del(vcsRunbook: VcsRunbookResource) {
        return this.client.del(vcsRunbook.Links.Self, vcsRunbook);
    }
}

export { VcsRunbookRepository };
