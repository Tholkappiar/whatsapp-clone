import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

const schema = defineSchema({
    ...authTables,
    chatCodes: defineTable({
        code: v.string(),
        userId: v.id("users"),
        isOneTime: v.boolean(),
        expiresAt: v.optional(v.number()),
        deletedAt: v.optional(v.number()),
    }),
    chatRequests: defineTable({
        requestedBy: v.id("users"),
        requestedTo: v.id("users"),
        chatCode: v.id("chatCodes"),
        status: v.union(
            v.literal("pending"),
            v.literal("accepted"),
            v.literal("declined")
        ),
        deletedAt: v.optional(v.number()),
    }),
});

export default schema;
