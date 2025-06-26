import { Password } from "@convex-dev/auth/providers/Password";
import { convexAuth } from "@convex-dev/auth/server";

// export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
//     providers: [Password],
// });

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
    providers: [
        Password({
            profile(params) {
                return {
                    name: params.name as string,
                    email: params.email as string,
                };
            },
        }),
    ],
});
