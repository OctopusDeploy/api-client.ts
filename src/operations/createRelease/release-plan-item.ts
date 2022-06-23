import { ChannelVersionRuleTestResult } from "./channel-version-rule-tester";

export class ReleasePlanItem {
    version: string | undefined;
    versionSource: string;
    channelVersionRuleTestResult: ChannelVersionRuleTestResult | undefined;
    isDisabled = false;

    constructor(
        readonly actionName: string,
        readonly packageReferenceName: string | undefined,
        readonly packageId: string | undefined,
        readonly packageFeedId: string | undefined,
        readonly isResolvable: boolean,
        userSpecifiedVersion: string | undefined
    ) {
        this.version = userSpecifiedVersion;
        this.versionSource = !this.version ? "Cannot resolve" : "User specified";
    }

    setVersionFromLatest(version: string) {
        this.version = version;
        this.versionSource = "Latest available";
    }

    setChannelVersionRuleTestResult(result: ChannelVersionRuleTestResult) {
        this.channelVersionRuleTestResult = result;
    }
}
