import { Feather } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { Animated, Text, TouchableOpacity } from "react-native";

type ToastType = "error" | "success" | "info";

interface ToastProps {
    visible: boolean;
    message: string;
    type?: ToastType;
    onHide: () => void;
}

// Custom Toast Component
const Toast: React.FC<ToastProps> = ({
    visible,
    message,
    type = "error",
    onHide,
}) => {
    const [translateY] = useState(new Animated.Value(-100));
    const [opacity] = useState(new Animated.Value(0));

    useEffect(() => {
        if (visible) {
            Animated.parallel([
                Animated.timing(translateY, {
                    toValue: 0,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.timing(opacity, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                }),
            ]).start();

            const timer = setTimeout(() => {
                hideToast();
            }, 3000);

            return () => clearTimeout(timer);
        }
    }, [visible]);

    const hideToast = () => {
        Animated.parallel([
            Animated.timing(translateY, {
                toValue: -100,
                duration: 300,
                useNativeDriver: true,
            }),
            Animated.timing(opacity, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            }),
        ]).start(() => {
            onHide();
        });
    };

    if (!visible) return null;

    const bgColor =
        type === "error"
            ? "bg-red-500"
            : type === "success"
            ? "bg-green-500"
            : "bg-blue-500";
    const icon =
        type === "error"
            ? "alert-circle"
            : type === "success"
            ? "check-circle"
            : "info";

    return (
        <Animated.View
            style={{
                transform: [{ translateY }],
                opacity,
                position: "absolute",
                top: 50,
                left: 20,
                right: 20,
                zIndex: 1000,
            }}
            className={`${bgColor} rounded-xl p-4 shadow-lg flex-row items-center`}
        >
            <Feather name={icon} size={20} color="white" />
            <Text className="text-white font-medium ml-3 flex-1">
                {message}
            </Text>
            <TouchableOpacity onPress={hideToast} className="ml-2">
                <Feather name="x" size={18} color="white" />
            </TouchableOpacity>
        </Animated.View>
    );
};

export default Toast;
