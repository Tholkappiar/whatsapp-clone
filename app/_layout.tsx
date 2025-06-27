import { ConvexAuthProvider } from "@convex-dev/auth/react";
import { ConvexReactClient, useConvexAuth } from "convex/react";
import { Stack } from "expo-router";
import * as SecureStore from "expo-secure-store";
import React from "react";
import { ActivityIndicator, Platform, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import "../global.css";
import AuthForm from "./(auth)/AuthForm";

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
        return <AuthForm />;
    }

    return <Stack screenOptions={{ headerShown: false }} />;
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
