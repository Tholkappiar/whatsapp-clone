import { getAuthUserId } from "@convex-dev/auth/server";
import { GenericMutationCtx, GenericQueryCtx } from "convex/server";
import { DataModel } from "./_generated/dataModel";

export async function requireAuth(
    ctx: GenericMutationCtx<DataModel> | GenericQueryCtx<DataModel>
) {
    const userID = await getAuthUserId(ctx);
    if (userID === null) {
        throw new Error("Unauthorized: User must be authenticated");
    }

    const user = await ctx.db
        .query("users")
        .filter((user) => user.eq(user.field("_id"), userID))
        .unique();
    return user;
}
