import { Client } from "../../client";
import { processConfiguration } from "../../clientConfiguration.test";
import { ServerTaskDetails } from "./serverTaskDetails";
import { ServerTaskWaiter } from "./serverTaskWaiter";

describe("push build information", () => {
    jest.setTimeout(100000);

    test("wait for non-existent task exits correctly", async () => {
        const client = await Client.create(processConfiguration());
        const serverTaskWaiter = new ServerTaskWaiter(client, "Default");

        const startTime = new Date();

        await expect(() => {
            return serverTaskWaiter.waitForServerTaskToComplete("ServerTasks-99999", 1000, 10000);
        }).rejects.toThrow("Unknown task Id(s) ServerTasks-99999");

        const endTime = new Date();
        const timeDiff = endTime.getTime() - startTime.getTime();
        expect(timeDiff).toBeLessThan(6000);
    });
});
