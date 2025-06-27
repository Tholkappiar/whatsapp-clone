import { Id } from "@/convex/_generated/dataModel";
import { Feather } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

interface ChatCode {
    _id: Id<"chatCodes">;
    _creationTime: number;
    expiresAt?: number | undefined;
    deletedAt?: number | undefined;
    isOneTime: boolean;
    code: string;
    userId: Id<"users">;
}

export const ChatCodeCard: React.FC<{ code: ChatCode }> = ({ code }) => {
    const handleCopy = async (code: string) => {
        Clipboard.setStringAsync(code);
    };

    const formatDate = (timestamp?: number) => {
        if (!timestamp) return "N/A";
        const date = new Date(timestamp);
        return date.toLocaleDateString();
    };

    return (
        <View className="bg-white rounded-2xl p-4 shadow-sm border border-gray-200 mb-4">
            <View className="flex-row justify-between items-center mb-2">
                <Text className="text-xl font-semibold text-gray-900">
                    {code.code}
                </Text>
                <TouchableOpacity onPress={() => handleCopy(code?.code)}>
                    <Feather name="copy" size={20} color="#4B5563" />
                </TouchableOpacity>
            </View>

            <View className="flex-row gap-3">
                {code.isOneTime && (
                    <Text className="text-xs bg-blue-500 rounded-lg px-2 py-1 text-white font-bold">
                        {code.isOneTime && "One Time"}
                    </Text>
                )}
                {code.expiresAt && (
                    <Text className="text-xs bg-orange-500 rounded-lg px-2 py-1 text-white font-bold">
                        Expires: {formatDate(code.expiresAt)}
                    </Text>
                )}

                <Text className="text-xs bg-gray-500 rounded-lg px-2 py-1 text-white font-bold">
                    Created: {formatDate(code._creationTime)}
                </Text>
            </View>
        </View>
    );
};
