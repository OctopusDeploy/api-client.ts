import type {
    AccountResource,
    AccountUsageResource,
    AzureEnvironment,
    AccountType,
    AzureWebSite,
    AzureWebSiteSlot,
    NewAccountResource
} from "@octopusdeploy/message-contracts";
import { BasicRepository, ListArgs } from "./basicRepository";
import type { Client } from "../client";

export type AccountRepositoryListArgs = {
    accountType?: AccountType[];
    ids?: string[],
    orderBy?: string;
    partialName?: string;
} & ListArgs;

export class AccountRepository extends BasicRepository<AccountResource, NewAccountResource, AccountRepositoryListArgs> {
    constructor(client: Client) {
        super("Accounts", client);
    }

    getAccountUsages(account: AccountResource): Promise<AccountUsageResource | undefined> {
        return this.client.get(account.Links["Usages"]);
    }

    getFabricApplications(account: AccountResource) {
        return this.client.get(account.Links["FabricApplications"]);
    }

    getIsolatedAzureEnvironments(): Promise<AzureEnvironment[]> {
        return this.client.get(this.client.getLink("AzureEnvironments"));
    }

    getResourceGroups(account: AccountResource) {
        return this.client.get(account.Links["ResourceGroups"]);
    }

    getStorageAccounts(account: AccountResource) {
        return this.client.get(account.Links["StorageAccounts"]);
    }

    getWebSites(account: AccountResource): Promise<AzureWebSite[]> {
        return this.client.get(account.Links["WebSites"]);
    }

    getWebSiteSlots(account: AccountResource, resourceGroupName: string, webSiteName: string): Promise<AzureWebSiteSlot[]> {
        const args: { resourceGroupName: string; webSiteName: string } = { resourceGroupName, webSiteName };
        return this.client.get(account.Links["WebSiteSlots"], args);
    }
}