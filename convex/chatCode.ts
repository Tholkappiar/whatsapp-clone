import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { requireAuth } from "./helpers";

// Generates a random 8-digit code
function generateRandomCode(): string {
    const code = Math.floor(10000000 + Math.random() * 90000000).toString();
    return code;
}

export const createChatCode = mutation({
    args: {
        isOneTime: v.boolean(),
        validityHours: v.number(),
    },
    handler: async (ctx, args) => {
        const identity = await requireAuth(ctx);
        const userId = identity?._id;
        if (!userId) {
            throw new Error("User: UserId not Found");
        }

        let code = generateRandomCode();
        let existingCode = await ctx.db
            .query("chatCodes")
            .filter((q) =>
                q.and(
                    q.eq(q.field("code"), code),
                    q.eq(q.field("deletedAt"), undefined),
                    q.or(
                        q.eq(q.field("expiresAt"), undefined),
                        q.gt(q.field("expiresAt"), Date.now())
                    )
                )
            )
            .first();

        while (existingCode) {
            code = generateRandomCode();
            existingCode = await ctx.db
                .query("chatCodes")
                .filter((q) =>
                    q.and(
                        q.eq(q.field("code"), code),
                        q.eq(q.field("deletedAt"), undefined),
                        q.or(
                            q.eq(q.field("expiresAt"), undefined),
                            q.gt(q.field("expiresAt"), Date.now())
                        )
                    )
                )
                .first();
        }

        const expiresAt =
            args.validityHours > 0
                ? Date.now() + args.validityHours * 60 * 60 * 1000
                : undefined;

        // Insert the new chat code
        const chatCodeId = await ctx.db.insert("chatCodes", {
            code,
            userId,
            isOneTime: args.isOneTime,
            expiresAt,
        });

        return { chatCodeId, code };
    },
});

export const getMyChatCode = query({
    handler: async (ctx) => {
        const identity = await requireAuth(ctx);

        const chatCode = await ctx.db
            .query("chatCodes")
            .filter((q) =>
                q.and(
                    q.eq(q.field("userId"), identity?._id),
                    q.eq(q.field("deletedAt"), undefined),
                    q.or(
                        q.eq(q.field("expiresAt"), undefined),
                        q.gt(q.field("expiresAt"), Date.now())
                    )
                )
            )
            .order("desc")
            .collect();

        return chatCode;
    },
});

export const checkChatCodeExists = query({
    args: { code: v.string() },
    handler: async (ctx, args) => {
        await requireAuth(ctx);
        const code = await ctx.db
            .query("chatCodes")
            .filter((q) =>
                q.and(
                    q.eq(q.field("code"), args.code),
                    q.eq(q.field("deletedAt"), undefined),
                    q.or(
                        q.eq(q.field("expiresAt"), undefined),
                        q.gt(q.field("expiresAt"), Date.now())
                    )
                )
            )
            .first();
        if (!code) {
            return null;
        }
        return code.code;
    },
});

export const checkChatCodeRequest = query({
    args: { code: v.string() },
    handler: async (ctx, args) => {
        const identity = await requireAuth(ctx);

        const chatCode = await ctx.db
            .query("chatCodes")
            .filter((q) =>
                q.and(
                    q.eq(q.field("code"), args.code),
                    q.eq(q.field("userId"), identity?._id),
                    q.eq(q.field("deletedAt"), undefined),
                    q.or(
                        q.eq(q.field("expiresAt"), undefined),
                        q.gt(q.field("expiresAt"), Date.now())
                    )
                )
            )
            .first();

        if (!chatCode) {
            return null;
        }

        const chatRequest = await ctx.db
            .query("chatRequests")
            .filter((q) =>
                q.and(
                    q.eq(q.field("requestedBy"), identity?._id),
                    q.eq(q.field("chatCode"), chatCode._id),
                    q.eq(q.field("deletedAt"), undefined)
                )
            )
            .first();

        if (!chatRequest) {
            return null;
        }

        return chatRequest._id;
    },
});

// user sending the request
export const sendChatRequest = mutation({
    args: { code: v.string() },
    handler: async (ctx, args) => {
        const identity = await requireAuth(ctx);
        if (!identity?._id) {
            throw new Error("User not Found");
        }
        const from = await ctx.db
            .query("chatCodes")
            .filter((code) => code.eq(code.field("code"), args.code))
            .first();
        if (!from?._id) {
            throw new Error("From user not Found");
        }
        const requestId = await ctx.db.insert("chatRequests", {
            chatCode: from._id,
            status: "pending",
            requestedTo: from?.userId,
            requestedBy: identity?._id,
        });
        return requestId;
    },
});

export const getAllRequest = query({
    handler: async (ctx) => {
        const identity = await requireAuth(ctx);
        const requests = await ctx.db
            .query("chatRequests")
            .filter((request) =>
                request.and(
                    request.eq(request.field("requestedTo"), identity?._id),
                    request.eq(request.field("deletedAt"), undefined)
                )
            )
            .collect();
        return requests;
    },
});

export const getAllSendRequest = query({
    handler: async (ctx) => {
        const identity = await requireAuth(ctx);
        const requests = await ctx.db
            .query("chatRequests")
            .filter((request) =>
                request.and(
                    request.eq(request.field("requestedBy"), identity?._id),
                    request.eq(request.field("deletedAt"), undefined)
                )
            )
            .collect();
        return requests;
    },
});

export const handleChatRequest = mutation({
    args: {
        requestId: v.id("chatRequests"),
        action: v.union(v.literal("accept"), v.literal("decline")),
    },
    handler: async (ctx, args) => {
        const identity = await requireAuth(ctx);

        const request = await ctx.db.get(args.requestId);
        console.log("request to : ", request?.requestedTo);
        console.log("identity : ", identity?._id);
        if (!request || request.requestedTo !== identity?._id) {
            throw new Error("Request not found or unauthorized");
        }

        if (args.action === "accept") {
            await ctx.db.patch(args.requestId, { status: "accepted" });
        } else {
            await ctx.db.patch(args.requestId, {
                status: "declined",
                deletedAt: Date.now(),
            });
        }

        return args.requestId;
    },
});
