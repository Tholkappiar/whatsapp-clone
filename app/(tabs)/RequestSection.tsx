import { ChatCodeCard } from "@/components/CodeCard";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Feather } from "@expo/vector-icons";
import { useMutation, useQuery } from "convex/react";
import React, { useState } from "react";
import {
    Alert,
    FlatList,
    ScrollView,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

interface ChatRequest {
    _id: Id<"chatRequests">;
    _creationTime: number;
    deletedAt?: number | undefined;
    chatCode: Id<"chatCodes">;
    requestedBy: Id<"users">;
    requestedTo: Id<"users">;
    status: "pending" | "accepted" | "declined";
}

const RequestSection: React.FC = () => {
    const [activeTab, setActiveTab] = useState<
        "received" | "sent" | "add" | "generate"
    >("received");
    const [chatCode, setChatCode] = useState<string>("");
    const [isOneTime, setIsOneTime] = useState<boolean>(true);
    const [validityHours, setValidityHours] = useState<string>("24");

    const myChatCodes = useQuery(api.chatCode.getMyChatCode) || [];
    const receivedRequests = useQuery(api.chatCode.getAllRequest) || [];
    const receivedInvites = useQuery(api.chatCode.getAllSendRequest) || [];
    const generateChatCode = useMutation(api.chatCode.createChatCode);
    const sendChatRequestMutation = useMutation(api.chatCode.sendChatRequest);
    const checkChatCodeExists = useQuery(api.chatCode.checkChatCodeExists, {
        code: chatCode,
    });
    const checkChatCodeRequest = useQuery(api.chatCode.checkChatCodeRequest, {
        code: chatCode,
    });
    const handleChatRequest = useMutation(api.chatCode.handleChatRequest);

    // Generate a new chat code
    const handleGenerateCode = async () => {
        const hours = parseInt(validityHours);
        if (isNaN(hours) || hours < 0) {
            Alert.alert(
                "Invalid Input",
                "Please enter a valid number of hours"
            );
            return;
        }
        try {
            const result = await generateChatCode({
                isOneTime,
                validityHours: hours,
            });
            Alert.alert("Success", `New chat code generated: ${result.code}`);
        } catch (error) {
            Alert.alert("Error", "Failed to generate chat code");
        }
    };

    const validateChatCode = (code: string): boolean => {
        return /^\d{8}$/.test(code);
    };

    const sendChatRequest = async (): Promise<void> => {
        if (!validateChatCode(chatCode)) {
            Alert.alert(
                "Invalid Code",
                "Please enter a valid 8-digit chat code"
            );
            return;
        }

        // Check if code exists
        if (!checkChatCodeExists) {
            Alert.alert("Invalid Code", "This chat code does not exist");
            return;
        }

        // Check if request already sent
        if (checkChatCodeRequest) {
            Alert.alert(
                "Request Already Sent",
                "You have already sent a request to this code"
            );
            return;
        }

        // Check if code belongs to the current user
        if (myChatCodes.some((c) => c.code === chatCode)) {
            Alert.alert(
                "Invalid Code",
                "You cannot send a request to yourself"
            );
            return;
        }

        try {
            await sendChatRequestMutation({ code: chatCode });
            setChatCode("");
            Alert.alert(
                "Request Sent!",
                "Your chat request has been sent successfully"
            );
        } catch (error: any) {
            Alert.alert(
                "Error",
                error.message || "Failed to send chat request"
            );
        }
    };

    const acceptRequest = async (requestId: Id<"chatRequests">) => {
        try {
            await handleChatRequest({ requestId, action: "accept" });
            Alert.alert("Request Accepted", "You can now start chatting!");
        } catch (error) {
            Alert.alert("Error", "Failed to accept request");
        }
    };

    const declineRequest = async (requestId: Id<"chatRequests">) => {
        try {
            await handleChatRequest({ requestId, action: "decline" });
            Alert.alert("Request Declined", "The request has been declined");
        } catch (error) {
            Alert.alert("Error", "Failed to decline request");
        }
    };

    const renderReceivedRequest = ({ item }: { item: ChatRequest }) => (
        <View className="bg-white m-2 p-4 rounded-lg border border-gray-200">
            <Text className="font-semibold text-gray-800">
                {/* Placeholder: Replace with actual user name from users table */}
                From: {item.requestedBy}
            </Text>
            <Text className="text-gray-500 text-sm mt-1">
                Code: {item.chatCode} •{" "}
                {new Date(item._creationTime).toLocaleString()}
            </Text>
            <View className="flex-row mt-3 space-x-3">
                <TouchableOpacity
                    onPress={() => acceptRequest(item._id)}
                    className="flex-1 bg-blue-500 py-2 rounded-lg"
                >
                    <Text className="text-white text-center font-medium">
                        Accept
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => declineRequest(item._id)}
                    className="flex-1 bg-gray-200 py-2 rounded-lg"
                >
                    <Text className="text-gray-700 text-center font-medium">
                        Decline
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    const renderSentRequest = ({ item }: { item: ChatRequest }) => (
        <View className="bg-white m-2 p-4 rounded-lg border border-gray-200">
            <Text className="font-semibold text-gray-800">
                To: {item.requestedTo}
            </Text>
            <Text className="text-gray-500 text-sm mt-1">
                Code: {item.chatCode} •{" "}
                {new Date(item._creationTime).toLocaleString()}
            </Text>
            <Text
                className={`text-sm mt-2 font-medium ${
                    item.status === "pending"
                        ? "text-yellow-600"
                        : item.status === "accepted"
                          ? "text-green-600"
                          : "text-red-600"
                }`}
            >
                {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
            </Text>
        </View>
    );

    const renderTabContent = () => {
        switch (activeTab) {
            case "received":
                return receivedRequests.length > 0 ? (
                    <FlatList
                        data={receivedRequests}
                        renderItem={renderReceivedRequest}
                        keyExtractor={(item) => item._id}
                        className="flex-1"
                        contentContainerStyle={{ paddingBottom: 20 }}
                    />
                ) : (
                    <View className="flex-1 items-center justify-center">
                        <Feather name="inbox" size={40} color="#9CA3AF" />
                        <Text className="text-lg font-semibold text-gray-600 mt-2">
                            No requests yet
                        </Text>
                    </View>
                );

            case "sent":
                return receivedInvites.length > 0 ? (
                    <FlatList
                        data={receivedInvites}
                        renderItem={renderSentRequest}
                        keyExtractor={(item) => item._id}
                        className="flex-1"
                        contentContainerStyle={{ paddingBottom: 20 }}
                    />
                ) : (
                    <View className="flex-1 items-center justify-center">
                        <Feather name="send" size={40} color="#9CA3AF" />
                        <Text className="text-lg font-semibold text-gray-600 mt-2">
                            No sent requests
                        </Text>
                    </View>
                );

            case "add":
                return (
                    <View className="flex-1 p-4">
                        <View className="bg-white p-4 rounded-lg border border-gray-200 mb-4">
                            <Text className="text-lg font-semibold text-gray-800 mb-2">
                                Generate Chat Code
                            </Text>
                            <View className="mt-2">
                                <View className="flex-row items-center justify-between mb-3">
                                    <Text className="text-gray-700">
                                        One-time use
                                    </Text>
                                    <Switch
                                        value={isOneTime}
                                        onValueChange={setIsOneTime}
                                        trackColor={{
                                            false: "#D1D5DB",
                                            true: "#3B82F6",
                                        }}
                                    />
                                </View>
                                <TextInput
                                    className="border border-gray-200 rounded-lg p-2 mb-3 text-gray-800"
                                    placeholder="Validity (hours, 0 for no expiration)"
                                    placeholderTextColor="#9CA3AF"
                                    value={validityHours}
                                    onChangeText={setValidityHours}
                                    keyboardType="numeric"
                                />
                                <TouchableOpacity
                                    onPress={handleGenerateCode}
                                    className="bg-blue-500 py-3 rounded-lg"
                                >
                                    <Text className="text-white text-center font-medium">
                                        Generate New Code
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                        <View className="bg-white p-4 rounded-lg border border-gray-200">
                            <Text className="text-lg font-semibold text-gray-800 mb-2">
                                Add New Chat
                            </Text>
                            <TextInput
                                className="border border-gray-200 rounded-lg p-2 mb-3 text-gray-800"
                                placeholder="Enter 8-digit code"
                                placeholderTextColor="#9CA3AF"
                                value={chatCode}
                                onChangeText={setChatCode}
                                keyboardType="numeric"
                                maxLength={8}
                            />
                            <TouchableOpacity
                                onPress={sendChatRequest}
                                disabled={!chatCode.trim()}
                                className={`py-3 rounded-lg ${
                                    chatCode.trim()
                                        ? "bg-blue-500"
                                        : "bg-gray-300"
                                }`}
                            >
                                <Text
                                    className={`text-center font-medium ${
                                        chatCode.trim()
                                            ? "text-white"
                                            : "text-gray-500"
                                    }`}
                                >
                                    Send Request
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                );
            case "generate":
                return (
                    <View className="flex-1 bg-gray-50 p-4">
                        <Text className="text-lg font-bold text-gray-800 mb-4">
                            Generated Codes
                        </Text>
                        <ScrollView
                            contentContainerStyle={{ paddingBottom: 20 }}
                            showsVerticalScrollIndicator={false}
                        >
                            {myChatCodes.length > 0 ? (
                                myChatCodes.map((code) => (
                                    <ChatCodeCard key={code._id} code={code} />
                                ))
                            ) : (
                                <View className="items-center">
                                    <Feather
                                        name="code"
                                        size={40}
                                        color="#9CA3AF"
                                    />
                                    <Text className="text-lg font-semibold text-gray-600 mt-2">
                                        No generated codes
                                    </Text>
                                </View>
                            )}
                        </ScrollView>
                    </View>
                );
            default:
                return null;
        }
    };

    return (
        <View className="flex-1 bg-gray-50">
            <View className="bg-white p-4 border-b border-gray-200">
                <Text className="text-xl font-bold text-gray-800">
                    Requests
                </Text>
                <View className="flex-row mt-3 space-x-2">
                    <TouchableOpacity
                        onPress={() => setActiveTab("received")}
                        className={`flex-1 py-2 rounded-lg ${
                            activeTab === "received"
                                ? "bg-blue-100"
                                : "bg-gray-100"
                        }`}
                    >
                        <Text
                            className={`text-center font-medium ${
                                activeTab === "received"
                                    ? "text-blue-600"
                                    : "text-gray-600"
                            }`}
                        >
                            Received
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => setActiveTab("sent")}
                        className={`flex-1 py-2 rounded-lg ${
                            activeTab === "sent" ? "bg-blue-100" : "bg-gray-100"
                        }`}
                    >
                        <Text
                            className={`text-center font-medium ${
                                activeTab === "sent"
                                    ? "text-blue-600"
                                    : "text-gray-600"
                            }`}
                        >
                            Sent
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => setActiveTab("add")}
                        className={`flex-1 py-2 rounded-lg ${
                            activeTab === "add" ? "bg-blue-100" : "bg-gray-100"
                        }`}
                    >
                        <Text
                            className={`text-center font-medium ${
                                activeTab === "add"
                                    ? "text-blue-600"
                                    : "text-gray-600"
                            }`}
                        >
                            New
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => setActiveTab("generate")}
                        className={`flex-1 py-2 rounded-lg ${
                            activeTab === "generate"
                                ? "bg-blue-100"
                                : "bg-gray-100"
                        }`}
                    >
                        <Text
                            className={`text-center font-medium ${
                                activeTab === "generate"
                                    ? "text-blue-600"
                                    : "text-gray-600"
                            }`}
                        >
                            Codes
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
            {renderTabContent()}
        </View>
    );
};

export default RequestSection;
