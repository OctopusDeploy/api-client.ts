import { apiLocation, Client } from "../..";
import { UserProjection } from "./user";

export async function userGetCurrent(client: Client): Promise<UserProjection> {
    const user = await client.get<UserProjection>(`${apiLocation}/users/me`);
    return user;
}
