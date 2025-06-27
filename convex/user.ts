import { query } from "./_generated/server";
import { requireAuth } from "./helpers";

export const getProfile = query({
    handler: async (ctx) => {
        const user = await requireAuth(ctx);
        return user;
    },
});
