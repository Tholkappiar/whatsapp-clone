import Toast from "@/components/Toast";
import { useAuthActions } from "@convex-dev/auth/react";
import { Feather } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
    Animated,
    KeyboardAvoidingView,
    Platform,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

type ToastType = "error" | "success" | "info";

interface FormData {
    email: string;
    password: string;
    confirmPassword: string;
    fullName: string;
}

interface ToastState {
    visible: boolean;
    message: string;
    type: ToastType;
}

const AuthForm: React.FC = () => {
    const { signIn } = useAuthActions();
    const [isSignUp, setIsSignUp] = useState<boolean>(false);
    const [formData, setFormData] = useState<FormData>({
        email: "",
        password: "",
        confirmPassword: "",
        fullName: "",
    });
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const [showConfirmPassword, setShowConfirmPassword] =
        useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [toast, setToast] = useState<ToastState>({
        visible: false,
        message: "",
        type: "error",
    });

    const [slideAnim] = useState(new Animated.Value(0));

    useEffect(() => {
        Animated.timing(slideAnim, {
            toValue: isSignUp ? 1 : 0,
            duration: 300,
            useNativeDriver: false,
        }).start();
    }, [isSignUp]);

    const showToast = (message: string, type: ToastType = "error"): void => {
        setToast({ visible: true, message, type });
    };

    const hideToast = (): void => {
        setToast({ visible: false, message: "", type: "error" });
    };

    const validateEmail = (email: string): boolean => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const validateForm = (): boolean => {
        if (!formData.email.trim()) {
            showToast("Email is required");
            return false;
        }

        if (!validateEmail(formData.email)) {
            showToast("Please enter a valid email address");
            return false;
        }

        if (!formData.password) {
            showToast("Password is required");
            return false;
        }

        if (formData.password.length < 8) {
            showToast("Password must be at least 8 characters long");
            return false;
        }

        if (isSignUp) {
            if (!formData.fullName.trim()) {
                showToast("Full name is required");
                return false;
            }

            if (!formData.confirmPassword) {
                showToast("Please confirm your password");
                return false;
            }

            if (formData.password !== formData.confirmPassword) {
                showToast("Passwords do not match");
                return false;
            }
        }

        return true;
    };

    const handleSubmit = async (): Promise<void> => {
        if (!validateForm()) return;

        setIsLoading(true);

        try {
            await signIn("password", {
                email: formData.email,
                password: formData.password,
                flow: isSignUp ? "signUp" : "signIn",
                // Add fullName for sign up if your Convex auth supports it
                ...(isSignUp && { name: formData.fullName }),
            });

            showToast(
                isSignUp
                    ? "Account created successfully!"
                    : "Signed in successfully!",
                "success"
            );

            setFormData({
                email: "",
                password: "",
                confirmPassword: "",
                fullName: "",
            });
        } catch (error: any) {
            let errorMessage = "Authentication failed. Please try again.";

            if (error?.message) {
                if (error.message.includes("Invalid credentials")) {
                    errorMessage = "Invalid email or password";
                } else if (error.message.includes("User already exists")) {
                    errorMessage = "An account with this email already exists";
                } else if (error.message.includes("Weak password")) {
                    errorMessage =
                        "Password is too weak. Please choose a stronger password";
                } else if (error.message.includes("Invalid email")) {
                    errorMessage = "Please enter a valid email address";
                } else {
                    errorMessage = error.message;
                }
            }

            showToast(errorMessage, "error");
        } finally {
            setIsLoading(false);
        }
    };

    const toggleMode = (): void => {
        setIsSignUp(!isSignUp);
        setFormData({
            email: "",
            password: "",
            confirmPassword: "",
            fullName: "",
        });
        hideToast();
    };

    return (
        <View className="flex-1 bg-gray-50">
            <Toast
                visible={toast.visible}
                message={toast.message}
                type={toast.type}
                onHide={hideToast}
            />

            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                className="flex-1"
            >
                <View className="flex-1 justify-center px-6 py-8">
                    {/* Header */}
                    <View className="items-center mb-5">
                        <View className="w-20 h-20 bg-blue-600 rounded-full items-center justify-center mb-6">
                            <Feather name="shield" size={24} color="white" />
                        </View>
                        <Text className="text-3xl font-bold text-gray-800 mb-1">
                            {isSignUp ? "Create Account" : "Welcome Back"}
                        </Text>
                        <Text className="text-gray-600 text-sm text-center">
                            {isSignUp
                                ? "Sign up to get started with your account"
                                : "Sign in to continue to your account"}
                        </Text>
                    </View>

                    {/* Form Container */}
                    <View className="bg-white rounded-2xl shadow-sm p-6 mb-6">
                        {/* Full Name Field (Sign Up Only) */}
                        <Animated.View
                            style={{
                                height: slideAnim.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [0, 80],
                                }),
                                opacity: slideAnim,
                            }}
                        >
                            {isSignUp && (
                                <View className="mb-4">
                                    <Text className="text-gray-700 font-medium mb-2">
                                        Full Name
                                    </Text>
                                    <View className="flex-row items-center bg-gray-50 rounded-xl px-2 py-1 border border-gray-200">
                                        <Feather
                                            name="user"
                                            size={20}
                                            color="#6B7280"
                                        />
                                        <TextInput
                                            className="flex-1 ml-3 text-gray-800"
                                            placeholder="Enter your full name"
                                            value={formData.fullName}
                                            onChangeText={(text: string) =>
                                                setFormData({
                                                    ...formData,
                                                    fullName: text,
                                                })
                                            }
                                            placeholderTextColor="#9CA3AF"
                                            editable={!isLoading}
                                        />
                                    </View>
                                </View>
                            )}
                        </Animated.View>

                        {/* Email Field */}
                        <View className="mb-4">
                            <Text className="text-gray-700 font-medium mb-2">
                                Email
                            </Text>
                            <View className="flex-row items-center bg-gray-50 rounded-xl px-2 py-1 border border-gray-200">
                                <Feather
                                    name="mail"
                                    size={20}
                                    color="#6B7280"
                                />
                                <TextInput
                                    className="flex-1 ml-3 text-gray-800"
                                    placeholder="Enter your email"
                                    value={formData.email}
                                    onChangeText={(text: string) =>
                                        setFormData({
                                            ...formData,
                                            email: text.toLowerCase(),
                                        })
                                    }
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    placeholderTextColor="#9CA3AF"
                                    editable={!isLoading}
                                />
                            </View>
                        </View>

                        {/* Password Field */}
                        <View className="mb-4">
                            <Text className="text-gray-700 font-medium mb-2">
                                Password
                            </Text>
                            <View className="flex-row items-center bg-gray-50 rounded-xl px-2 py-1 border border-gray-200">
                                <Feather
                                    name="lock"
                                    size={20}
                                    color="#6B7280"
                                />
                                <TextInput
                                    className="flex-1 ml-3 text-gray-800"
                                    placeholder="Enter your password"
                                    value={formData.password}
                                    onChangeText={(text: string) =>
                                        setFormData({
                                            ...formData,
                                            password: text,
                                        })
                                    }
                                    secureTextEntry={!showPassword}
                                    placeholderTextColor="#9CA3AF"
                                    editable={!isLoading}
                                />
                                <TouchableOpacity
                                    onPress={() =>
                                        setShowPassword(!showPassword)
                                    }
                                    className="ml-2"
                                    disabled={isLoading}
                                >
                                    <Feather
                                        name={showPassword ? "eye-off" : "eye"}
                                        size={20}
                                        color="#6B7280"
                                    />
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Confirm Password Field (Sign Up Only) */}
                        <Animated.View
                            style={{
                                height: slideAnim.interpolate({
                                    inputRange: [0, 1],
                                    outputRange: [0, 80],
                                }),
                                opacity: slideAnim,
                            }}
                        >
                            {isSignUp && (
                                <View className="mb-6">
                                    <Text className="text-gray-700 font-medium mb-2">
                                        Confirm Password
                                    </Text>
                                    <View className="flex-row items-center bg-gray-50 rounded-xl px-2 py-1 border border-gray-200">
                                        <Feather
                                            name="lock"
                                            size={20}
                                            color="#6B7280"
                                        />
                                        <TextInput
                                            className="flex-1 ml-3 text-gray-800"
                                            placeholder="Confirm your password"
                                            value={formData.confirmPassword}
                                            onChangeText={(text: string) =>
                                                setFormData({
                                                    ...formData,
                                                    confirmPassword: text,
                                                })
                                            }
                                            secureTextEntry={
                                                !showConfirmPassword
                                            }
                                            placeholderTextColor="#9CA3AF"
                                            editable={!isLoading}
                                        />
                                        <TouchableOpacity
                                            onPress={() =>
                                                setShowConfirmPassword(
                                                    !showConfirmPassword
                                                )
                                            }
                                            className="ml-2"
                                            disabled={isLoading}
                                        >
                                            <Feather
                                                name={
                                                    showConfirmPassword
                                                        ? "eye-off"
                                                        : "eye"
                                                }
                                                size={20}
                                                color="#6B7280"
                                            />
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            )}
                        </Animated.View>

                        {/* Submit Button */}
                        <TouchableOpacity
                            onPress={handleSubmit}
                            disabled={isLoading}
                            className={`bg-blue-600 rounded-xl my-4 py-4 items-center ${
                                isLoading ? "opacity-70" : ""
                            }`}
                        >
                            {isLoading ? (
                                <View className="flex-row items-center">
                                    <Text className="text-white font-semibold mr-2">
                                        {isSignUp
                                            ? "Creating Account..."
                                            : "Signing In..."}
                                    </Text>
                                </View>
                            ) : (
                                <Text className="text-white font-semibold text-lg">
                                    {isSignUp ? "Create Account" : "Sign In"}
                                </Text>
                            )}
                        </TouchableOpacity>
                    </View>

                    {/* Toggle Mode */}
                    <View className="items-center">
                        <Text className="text-gray-600 mb-1">
                            {isSignUp
                                ? "Already have an account?"
                                : "Don't have an account?"}
                        </Text>
                        <TouchableOpacity
                            onPress={toggleMode}
                            className="py-1"
                            disabled={isLoading}
                        >
                            <Text
                                className={`font-semibold ${isLoading ? "text-gray-400" : "text-blue-600"}`}
                            >
                                {isSignUp ? "Sign In" : "Sign Up"}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* Forgot Password (Sign In Only) */}
                    {!isSignUp && (
                        <TouchableOpacity
                            className="items-center mt-4"
                            disabled={isLoading}
                        >
                            <Text
                                className={`font-medium ${isLoading ? "text-gray-400" : "text-blue-600"}`}
                            >
                                Forgot Password?
                            </Text>
                        </TouchableOpacity>
                    )}
                </View>
            </KeyboardAvoidingView>
        </View>
    );
};

export default AuthForm;
