import { ConvexAuthProvider } from "@convex-dev/auth/react";
import { ConvexReactClient, useConvexAuth } from "convex/react";
import { Redirect, Stack } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { ActivityIndicator, Platform, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import "../global.css";

const convex = new ConvexReactClient(process.env.EXPO_PUBLIC_CONVEX_URL!, {
    unsavedChangesWarning: false,
});

const secureStorage = {
    getItem: SecureStore.getItemAsync,
    setItem: SecureStore.setItemAsync,
    removeItem: SecureStore.deleteItemAsync,
};

function AuthCheck() {
    const { isAuthenticated, isLoading } = useConvexAuth();

    if (isLoading) {
        return (
            <View className="flex-1 justify-center">
                <Text className="text-center my-4 text-lg">
                    Authenticating ...
                </Text>
                <ActivityIndicator size={"large"} />
            </View>
        );
    }

    if (!isAuthenticated) {
        return <Redirect href="/(auth)/AuthForm" />;
    }

    return (
        <Stack>
            <Stack.Screen name="(tabs)/index" />
        </Stack>
    );
}

export default function RootLayout() {
    return (
        <ConvexAuthProvider
            client={convex}
            storage={
                Platform.OS === "android" || Platform.OS === "ios"
                    ? secureStorage
                    : undefined
            }
        >
            <SafeAreaView className="flex-1 bg-gray-50">
                <AuthCheck />
            </SafeAreaView>
        </ConvexAuthProvider>
    );
}
