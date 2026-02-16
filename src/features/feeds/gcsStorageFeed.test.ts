import type { GcsStorageFeed } from "./gcsStorageFeed";
import { FeedType } from "./feedType";

describe("gcsStorageFeed", () => {
    test("can create with service account key", () => {
        const feed: GcsStorageFeed = {
            Id: "feeds-123",
            Name: "Test GCS Feed",
            FeedType: FeedType.GcsStorage,
            SpaceId: "Spaces-1",
            UseServiceAccountKey: true,
            ServiceAccountJsonKey: {
                HasValue: true,
                NewValue: '{"type":"service_account"}',
            },
            Project: "my-project",
            DownloadAttempts: 5,
            DownloadRetryBackoffSeconds: 10,
        };

        expect(feed.Name).toBe("Test GCS Feed");
        expect(feed.UseServiceAccountKey).toBe(true);
        expect(feed.DownloadAttempts).toBe(5);
        expect(feed.DownloadRetryBackoffSeconds).toBe(10);
    });

    test("can create with OIDC authentication", () => {
        const feed: GcsStorageFeed = {
            Id: "feeds-456",
            Name: "Test GCS Feed OIDC",
            FeedType: FeedType.GcsStorage,
            SpaceId: "Spaces-1",
            UseServiceAccountKey: false,
            OidcAuthentication: {
                Audience: "api://AzureADTokenExchange",
                SubjectKeys: ["space", "feed"],
            },
            DownloadAttempts: 3,
            DownloadRetryBackoffSeconds: 5,
        };

        expect(feed.Name).toBe("Test GCS Feed OIDC");
        expect(feed.UseServiceAccountKey).toBe(false);
        expect(feed.OidcAuthentication?.Audience).toBe("api://AzureADTokenExchange");
        expect(feed.DownloadAttempts).toBe(3);
        expect(feed.DownloadRetryBackoffSeconds).toBe(5);
    });
});
