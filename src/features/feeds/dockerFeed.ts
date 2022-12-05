import type { FeedType } from "./feedType";
import type { SensitiveValue } from "../variables";
import { SpaceScopedResource } from "../../spaceScopedResource";
import { NamedResource } from "../../namedResource";

export interface DockerFeed extends SpaceScopedResource, NamedResource {
    FeedType: FeedType.Docker;
    Name: string;
    ApiVersion?: any;
    FeedUri: string;
    Password?: SensitiveValue;
    RegistryPath: string;
    Username?: any;
}
