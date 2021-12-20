import type { ChannelVersionRuleResource } from '@octopusdeploy/message-contracts';
import { Resource } from '@octopusdeploy/message-contracts';
import { SemVer } from 'semver';
import {Client} from "../../client";

export interface IChannelVersionRuleTester {
  test(
    rule: ChannelVersionRuleResource | undefined,
    packageVersion: string | undefined,
    feedId: string | undefined
  ): Promise<ChannelVersionRuleTestResult>;
}

export class ChannelVersionRuleTester implements IChannelVersionRuleTester {
  constructor(readonly client: Client) {}

  async test(
    rule: ChannelVersionRuleResource,
    packageVersion: string | undefined,
    feedId: string
  ) {
    if (rule === null)
      // Anything goes if there is no rule defined for this step
      return ChannelVersionRuleTestResult.Null();

    if (!packageVersion)
      // If we don't have a package version, this rule should be ignored
      return ChannelVersionRuleTestResult.Failed();

    const link = this.client.getLink('VersionRuleTest');

    const resource = {
      version: packageVersion,
      versionRange: rule.VersionRange,
      preReleaseTag: rule.Tag,
      feedId
    };

    const version = this.client.tryGetServerInformation()?.version;

    if (version !== undefined && new SemVer(version) > new SemVer('2021.2')) {
      return this.client.post<ChannelVersionRuleTestResult>(link, resource);
    }

    return this.client.get<ChannelVersionRuleTestResult>(link, resource);
  }
}

const Pass = 'PASS';
const Fail = 'FAIL';

export class ChannelVersionRuleTestResult implements Resource {
  satisfiesVersionRange = false;
  satisfiesPreReleaseTag = false;
  isNull = false;

  get isSatisfied() {
    return this.satisfiesVersionRange && this.satisfiesPreReleaseTag;
  }

  toSummaryString() {
    return this.isNull
      ? 'Allow any version'
      : `Range: ${this.satisfiesVersionRange ? Pass : Fail} Tag: ${
          this.satisfiesPreReleaseTag ? Pass : Fail
        }`;
  }

  static Failed() {
    return new ChannelVersionRuleTestResult();
  }

  static Null() {
    const channelVersionRuleTestResult = new ChannelVersionRuleTestResult();
    channelVersionRuleTestResult.isNull = true;
    channelVersionRuleTestResult.satisfiesVersionRange = true;
    channelVersionRuleTestResult.satisfiesPreReleaseTag = true;

    return channelVersionRuleTestResult;
  }
}
