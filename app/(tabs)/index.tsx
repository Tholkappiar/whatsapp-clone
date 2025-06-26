import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
    FlatList,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

// Types
interface ChatItem {
    id: string;
    name: string;
    lastMessage: string;
    timestamp: string;
    unreadCount: number;
    isOnline: boolean;
    avatar?: string;
    chatCode: string;
}

interface Message {
    id: string;
    text: string;
    timestamp: string;
    isMe: boolean;
    status: "sent" | "delivered" | "read";
}

const ChatSection: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [selectedChat, setSelectedChat] = useState<ChatItem | null>(null);
    const [messageText, setMessageText] = useState<string>("");
    const [messages, setMessages] = useState<Message[]>([
        {
            id: "1",
            text: "Hey! How are you doing?",
            timestamp: "10:30 AM",
            isMe: false,
            status: "read",
        },
        {
            id: "2",
            text: "I'm doing great! Just working on some new projects. How about you?",
            timestamp: "10:32 AM",
            isMe: true,
            status: "read",
        },
        {
            id: "3",
            text: "That sounds awesome! I'd love to hear more about it.",
            timestamp: "10:35 AM",
            isMe: false,
            status: "read",
        },
        {
            id: "4",
            text: "Sure! Let's catch up soon.",
            timestamp: "10:36 AM",
            isMe: true,
            status: "delivered",
        },
    ]);

    // Mock data for chats
    const [chats] = useState<ChatItem[]>([
        {
            id: "1",
            name: "John Doe",
            lastMessage: "That sounds awesome! I'd love to hear more about it.",
            timestamp: "10:35 AM",
            unreadCount: 2,
            isOnline: true,
            chatCode: "12345678",
        },
        {
            id: "2",
            name: "Sarah Wilson",
            lastMessage: "See you tomorrow!",
            timestamp: "Yesterday",
            unreadCount: 0,
            isOnline: false,
            chatCode: "87654321",
        },
        {
            id: "3",
            name: "Mike Johnson",
            lastMessage: "Thanks for the help!",
            timestamp: "Monday",
            unreadCount: 1,
            isOnline: true,
            chatCode: "11223344",
        },
        {
            id: "4",
            name: "Emma Davis",
            lastMessage: "Perfect! Let me know when you're ready.",
            timestamp: "Sunday",
            unreadCount: 0,
            isOnline: false,
            chatCode: "44332211",
        },
    ]);

    const filteredChats = chats.filter(
        (chat) =>
            chat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            chat.chatCode.includes(searchQuery)
    );

    const getInitials = (name: string): string => {
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
    };

    const formatTimestamp = (timestamp: string): string => {
        // In a real app, you'd format this properly based on the actual date
        return timestamp;
    };

    const sendMessage = (): void => {
        if (messageText.trim() && selectedChat) {
            const newMessage: Message = {
                id: Date.now().toString(),
                text: messageText.trim(),
                timestamp: new Date().toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                }),
                isMe: true,
                status: "sent",
            };
            setMessages([...messages, newMessage]);
            setMessageText("");
        }
    };

    const renderChatItem = ({ item }: { item: ChatItem }) => (
        <TouchableOpacity
            className="flex-row items-center px-4 py-3 bg-white active:bg-gray-50"
            onPress={() => setSelectedChat(item)}
        >
            {/* Avatar */}
            <View className="relative">
                <View className="w-12 h-12 rounded-full bg-blue-500 items-center justify-center">
                    <Text className="text-white font-semibold text-lg">
                        {getInitials(item.name)}
                    </Text>
                </View>
                {item.isOnline && (
                    <View className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white" />
                )}
            </View>

            {/* Chat Info */}
            <View className="flex-1 ml-3 border-b border-gray-100 pb-3">
                <View className="flex-row items-center justify-between mb-1">
                    <Text className="font-semibold text-gray-900 text-base">
                        {item.name}
                    </Text>
                    <Text className="text-gray-500 text-sm">
                        {formatTimestamp(item.timestamp)}
                    </Text>
                </View>
                <View className="flex-row items-center justify-between">
                    <Text
                        className="text-gray-600 text-sm flex-1 mr-2"
                        numberOfLines={1}
                    >
                        {item.lastMessage}
                    </Text>
                    {item.unreadCount > 0 && (
                        <View className="bg-blue-500 rounded-full min-w-[20px] h-5 items-center justify-center px-1">
                            <Text className="text-white text-xs font-medium">
                                {item.unreadCount > 99
                                    ? "99+"
                                    : item.unreadCount}
                            </Text>
                        </View>
                    )}
                </View>
                <Text className="text-gray-400 text-xs mt-1">
                    Code: {item.chatCode}
                </Text>
            </View>
        </TouchableOpacity>
    );

    const renderMessage = ({ item }: { item: Message }) => (
        <View className={`mb-3 ${item.isMe ? "items-end" : "items-start"}`}>
            <View
                className={`max-w-[80%] px-4 py-2 rounded-2xl ${
                    item.isMe
                        ? "bg-blue-500 rounded-br-md"
                        : "bg-gray-100 rounded-bl-md"
                }`}
            >
                <Text
                    className={`text-base ${item.isMe ? "text-white" : "text-gray-800"}`}
                >
                    {item.text}
                </Text>
            </View>
            <View className="flex-row items-center mt-1 px-2">
                <Text className="text-gray-500 text-xs">{item.timestamp}</Text>
                {item.isMe && (
                    <Feather
                        name={item.status === "read" ? "check-circle" : "check"}
                        size={12}
                        color={item.status === "read" ? "#3B82F6" : "#9CA3AF"}
                        style={{ marginLeft: 4 }}
                    />
                )}
            </View>
        </View>
    );

    if (selectedChat) {
        return (
            <View className="flex-1 bg-gray-50">
                {/* Chat Header */}
                <View className="bg-white px-4 py-3 flex-row items-center border-b border-gray-200">
                    <TouchableOpacity
                        onPress={() => setSelectedChat(null)}
                        className="mr-3"
                    >
                        <Feather name="arrow-left" size={24} color="#374151" />
                    </TouchableOpacity>

                    <View className="w-10 h-10 rounded-full bg-blue-500 items-center justify-center mr-3">
                        <Text className="text-white font-semibold">
                            {getInitials(selectedChat.name)}
                        </Text>
                    </View>

                    <View className="flex-1">
                        <Text className="font-semibold text-gray-900 text-lg">
                            {selectedChat.name}
                        </Text>
                        <Text className="text-gray-500 text-sm">
                            {selectedChat.isOnline
                                ? "Online"
                                : "Last seen recently"}
                        </Text>
                    </View>

                    <TouchableOpacity className="p-2">
                        <Feather name="phone" size={20} color="#374151" />
                    </TouchableOpacity>
                    <TouchableOpacity className="p-2 ml-2">
                        <Feather name="video" size={20} color="#374151" />
                    </TouchableOpacity>
                </View>

                {/* Messages */}
                <FlatList
                    data={messages}
                    renderItem={renderMessage}
                    keyExtractor={(item) => item.id}
                    className="flex-1 px-4 py-4"
                    showsVerticalScrollIndicator={false}
                />

                {/* Message Input */}
                <View className="bg-white px-4 py-3 flex-row items-center border-t border-gray-200">
                    <View className="flex-1 flex-row items-center bg-gray-100 rounded-full px-4 py-2 mr-3">
                        <TextInput
                            className="flex-1 text-gray-800 text-base"
                            placeholder="Type a message..."
                            value={messageText}
                            onChangeText={setMessageText}
                            multiline
                            maxLength={1000}
                            placeholderTextColor="#9CA3AF"
                        />
                        <TouchableOpacity className="ml-2">
                            <Feather
                                name="paperclip"
                                size={20}
                                color="#6B7280"
                            />
                        </TouchableOpacity>
                    </View>
                    <TouchableOpacity
                        onPress={sendMessage}
                        className="w-10 h-10 bg-blue-500 rounded-full items-center justify-center"
                        disabled={!messageText.trim()}
                    >
                        <Feather name="send" size={18} color="white" />
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    return (
        <View className="flex-1 bg-gray-50">
            {/* Header */}
            <View className="bg-white px-4 py-6 border-b border-gray-200">
                <View className="flex-row items-center justify-between mb-4">
                    <Text className="text-2xl font-bold text-gray-900">
                        Chats
                    </Text>
                    <View className="flex-row gap-4">
                        <TouchableOpacity>
                            <Feather name="edit" size={24} color="#374151" />
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() =>
                                router.navigate("/(components)/Profile")
                            }
                        >
                            <Feather
                                name="more-vertical"
                                size={24}
                                color="#374151"
                            />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Search Bar */}
                <View className="flex-row items-center bg-gray-100 rounded-full px-4 py-2">
                    <Feather name="search" size={20} color="#6B7280" />
                    <TextInput
                        className="flex-1 ml-3 text-gray-800"
                        placeholder="Search chats or codes..."
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        placeholderTextColor="#9CA3AF"
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity
                            onPress={() => setSearchQuery("")}
                            className="ml-2"
                        >
                            <Feather name="x" size={18} color="#6B7280" />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {/* Chat List */}
            {filteredChats.length > 0 ? (
                <FlatList
                    data={filteredChats}
                    renderItem={renderChatItem}
                    keyExtractor={(item) => item.id}
                    className="flex-1"
                    showsVerticalScrollIndicator={false}
                />
            ) : (
                <View className="flex-1 items-center justify-center px-8">
                    <View className="w-20 h-20 bg-gray-200 rounded-full items-center justify-center mb-4">
                        <Feather
                            name="message-circle"
                            size={32}
                            color="#9CA3AF"
                        />
                    </View>
                    <Text className="text-xl font-semibold text-gray-900 mb-2 text-center">
                        {searchQuery ? "No chats found" : "No chats yet"}
                    </Text>
                    <Text className="text-gray-600 text-center leading-6">
                        {searchQuery
                            ? "Try searching with a different name or chat code"
                            : "Start a conversation by adding someone with their chat code"}
                    </Text>
                </View>
            )}
        </View>
    );
};

export default ChatSection;
