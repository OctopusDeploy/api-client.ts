import type {
    ChannelResource,
    DeploymentPreviewResource,
    DeploymentPreviewRequests,
    DeploymentPromotionTarget,
    DeploymentResource,
    DeploymentTemplateResource,
    LifecycleProgressionResource,
    LifecycleResource,
    ResourceCollection,
    ReleaseResource
} from "@octopusdeploy/message-contracts"
import type { ListArgs } from "./basicRepository";
import { BasicRepository } from "./basicRepository";
import type { Client } from "../client";

type GetDeploymentArgs = ListArgs;

export class ReleasesRepository extends BasicRepository<ReleaseResource, ReleaseResource> {
    constructor(client: Client) {
        super("Releases", client);
    }
    getDeployments(release: ReleaseResource, options?: GetDeploymentArgs): Promise<ResourceCollection<DeploymentResource>> {
        return this.client.get(release.Links["Deployments"], options);
    }
    getDeploymentTemplate(release: ReleaseResource): Promise<DeploymentTemplateResource> {
        return this.client.get(release.Links["DeploymentTemplate"]) as Promise<DeploymentTemplateResource>;
    }
    getDeploymentPreview(promotionTarget: DeploymentPromotionTarget) {
        return this.client.get<DeploymentPreviewResource>(promotionTarget.Links["Preview"], { includeDisabledSteps: true });
    }
    progression(release: ReleaseResource): Promise<LifecycleProgressionResource> {
        return this.client.get(release.Links["Progression"]);
    }
    snapshotVariables(release: ReleaseResource): Promise<ReleaseResource> {
        return this.client.post(release.Links["SnapshotVariables"]);
    }
    deploymentPreviews(release: ReleaseResource, deploymentTemplates: DeploymentPreviewRequests): Promise<DeploymentPreviewResource[]> {
        return this.client.post(release.Links["DeploymentPreviews"], deploymentTemplates);
    }
    getChannel(release: ReleaseResource): Promise<ChannelResource> {
        return this.client.get(release.Links["Channel"]);
    }
    getLifecycle(release: ReleaseResource): Promise<LifecycleResource> {
        return this.client.get(release.Links["Lifecycle"]);
    }
}