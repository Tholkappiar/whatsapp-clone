import { Feather } from "@expo/vector-icons";
import React, { useState } from "react";
import {
    Alert,
    FlatList,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

// Types
interface ChatRequest {
    id: string;
    name: string;
    chatCode: string;
    timestamp: string;
}

interface SentRequest {
    id: string;
    chatCode: string;
    timestamp: string;
    status: "pending" | "accepted" | "declined";
}

const RequestSection: React.FC = () => {
    const [activeTab, setActiveTab] = useState<"received" | "sent" | "add">(
        "received"
    );
    const [chatCode, setChatCode] = useState<string>("");
    const [myCode] = useState<string>("87654321"); // Mocked user code

    // Mock data for received requests
    const [receivedRequests, setReceivedRequests] = useState<ChatRequest[]>([
        {
            id: "1",
            name: "Alice",
            chatCode: "12345678",
            timestamp: "2 hours ago",
        },
        { id: "2", name: "Bob", chatCode: "87654321", timestamp: "1 day ago" },
    ]);

    // Mock data for sent requests
    const [sentRequests, setSentRequests] = useState<SentRequest[]>([
        {
            id: "1",
            chatCode: "99887766",
            timestamp: "1 hour ago",
            status: "pending",
        },
        {
            id: "2",
            chatCode: "55443322",
            timestamp: "1 day ago",
            status: "accepted",
        },
    ]);

    const validateChatCode = (code: string): boolean => {
        return /^\d{8}$/.test(code);
    };

    const sendChatRequest = (): void => {
        if (!validateChatCode(chatCode)) {
            Alert.alert(
                "Invalid Code",
                "Please enter a valid 8-digit chat code"
            );
            return;
        }
        if (chatCode === myCode) {
            Alert.alert(
                "Invalid Code",
                "You cannot send a request to yourself"
            );
            return;
        }
        const alreadySent = sentRequests.some(
            (req) => req.chatCode === chatCode
        );
        if (alreadySent) {
            Alert.alert(
                "Request Already Sent",
                "You have already sent a request to this code"
            );
            return;
        }

        const newRequest: SentRequest = {
            id: Date.now().toString(),
            chatCode: chatCode,
            timestamp: "Just now",
            status: "pending",
        };
        setSentRequests([newRequest, ...sentRequests]);
        setChatCode("");
        Alert.alert(
            "Request Sent!",
            "Your chat request has been sent successfully"
        );
    };

    const acceptRequest = (requestId: string): void => {
        setReceivedRequests((prev) =>
            prev.filter((req) => req.id !== requestId)
        );
        Alert.alert("Request Accepted", "You can now start chatting!");
    };

    const declineRequest = (requestId: string): void => {
        setReceivedRequests((prev) =>
            prev.filter((req) => req.id !== requestId)
        );
    };

    const renderReceivedRequest = ({ item }: { item: ChatRequest }) => (
        <View className="bg-white m-2 p-3 rounded-lg border border-gray-200">
            <Text className="font-semibold">{item.name}</Text>
            <Text className="text-gray-500 text-sm">
                Code: {item.chatCode} • {item.timestamp}
            </Text>
            <View className="flex-row mt-2 space-x-2">
                <TouchableOpacity
                    onPress={() => acceptRequest(item.id)}
                    className="flex-1 bg-blue-500 p-2 rounded"
                >
                    <Text className="text-white text-center">Accept</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => declineRequest(item.id)}
                    className="flex-1 bg-gray-200 p-2 rounded"
                >
                    <Text className="text-gray-700 text-center">Decline</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    const renderSentRequest = ({ item }: { item: SentRequest }) => (
        <View className="bg-white m-2 p-3 rounded-lg border border-gray-200">
            <Text className="font-semibold">Code: {item.chatCode}</Text>
            <Text className="text-gray-500 text-sm">{item.timestamp}</Text>
            <Text
                className={`text-sm mt-1 ${
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
                        keyExtractor={(item) => item.id}
                        className="flex-1"
                    />
                ) : (
                    <View className="flex-1 items-center justify-center">
                        <Feather name="inbox" size={40} color="#9CA3AF" />
                        <Text className="text-lg font-semibold mt-2">
                            No requests yet
                        </Text>
                    </View>
                );

            case "sent":
                return sentRequests.length > 0 ? (
                    <FlatList
                        data={sentRequests}
                        renderItem={renderSentRequest}
                        keyExtractor={(item) => item.id}
                        className="flex-1"
                    />
                ) : (
                    <View className="flex-1 items-center justify-center">
                        <Feather name="send" size={40} color="#9CA3AF" />
                        <Text className="text-lg font-semibold mt-2">
                            No sent requests
                        </Text>
                    </View>
                );

            case "add":
                return (
                    <View className="flex-1 p-4">
                        <View className="bg-white p-4 rounded-lg border border-gray-200 mb-4">
                            <Text className="text-lg font-semibold">
                                Your Chat Code
                            </Text>
                            <Text className="text-gray-500">{myCode}</Text>
                        </View>
                        <View className="bg-white p-4 rounded-lg border border-gray-200">
                            <Text className="text-lg font-semibold mb-2">
                                Add New Chat
                            </Text>
                            <TextInput
                                className="border border-gray-200 rounded p-2 mb-2"
                                placeholder="Enter 8-digit code"
                                value={chatCode}
                                onChangeText={setChatCode}
                                keyboardType="numeric"
                                maxLength={8}
                            />
                            <TouchableOpacity
                                onPress={sendChatRequest}
                                disabled={!chatCode.trim()}
                                className={`p-3 rounded ${chatCode.trim() ? "bg-blue-500" : "bg-gray-300"}`}
                            >
                                <Text
                                    className={`text-center ${chatCode.trim() ? "text-white" : "text-gray-500"}`}
                                >
                                    Send Request
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                );

            default:
                return null;
        }
    };

    return (
        <View className="flex-1 bg-gray-50">
            <View className="bg-white p-4 border-b border-gray-200">
                <Text className="text-xl font-bold">Requests</Text>
                <View className="flex-row mt-2">
                    <TouchableOpacity
                        onPress={() => setActiveTab("received")}
                        className={`flex-1 p-2 rounded ${activeTab === "received" ? "bg-blue-100" : "bg-gray-100"}`}
                    >
                        <Text
                            className={`text-center ${activeTab === "received" ? "text-blue-600" : "text-gray-600"}`}
                        >
                            Received
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => setActiveTab("sent")}
                        className={`flex-1 p-2 rounded ${activeTab === "sent" ? "bg-blue-100" : "bg-gray-100"}`}
                    >
                        <Text
                            className={`text-center ${activeTab === "sent" ? "text-blue-600" : "text-gray-600"}`}
                        >
                            Sent
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => setActiveTab("add")}
                        className={`flex-1 p-2 rounded ${activeTab === "add" ? "bg-blue-100" : "bg-gray-100"}`}
                    >
                        <Text
                            className={`text-center ${activeTab === "add" ? "text-blue-600" : "text-gray-600"}`}
                        >
                            Add New
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
            {renderTabContent()}
        </View>
    );
};

export default RequestSection;
