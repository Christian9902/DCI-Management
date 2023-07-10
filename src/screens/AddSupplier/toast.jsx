import React, { useEffect, useRef } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import Animated, {
  FadeInUp,
  FadeOutUp,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import Icon from "react-native-vector-icons/MaterialIcons";

const ToastNotification = ({ userName }) => {
  const fadeAnimation = useSharedValue(0);
  const progressAnimation = useSharedValue(1);

  const toastStyle = useAnimatedStyle(() => {
    return {
      opacity: fadeAnimation.value,
    };
  });

  const progressStyle = useAnimatedStyle(() => {
    return {
      width: `${progressAnimation.value * 100}%`,
    };
  });

  const closeToast = () => {
    fadeAnimation.value = withTiming(0, { duration: 300 });
  };

  useEffect(() => {
    fadeAnimation.value = withTiming(1, { duration: 300 });

    const timeout = setTimeout(() => {
      fadeAnimation.value = withTiming(0, { duration: 300 });
    }, 3000);

    const progressBarAnimation = withTiming(0, { duration: 3000 });
    progressAnimation.value = progressBarAnimation;

    return () => {
      clearTimeout(timeout);
      progressAnimation.value = 0;
    };
  }, []);

  return (
    <Animated.View style={[toastStyle, styles.toastContainer]}>
      <Icon name="info" size={30} color="#F6F4F4" />
      <View style={styles.toastContent}>
        <Text style={styles.toastTitle}>WELCOME</Text>
        <Text style={styles.toastMessage}>{userName}</Text>
      </View>
      <TouchableOpacity onPress={closeToast} style={styles.closeButton}>
        <Icon name="close" size={20} color="#F6F4F4" />
      </TouchableOpacity>
      <Animated.View style={[styles.progressBar, progressStyle]} />
    </Animated.View>
  );
};

export default ToastNotification;

const styles = {
  toastContainer: {
    top: 10,
    backgroundColor: "#000",
    width: "90%",
    position: "absolute",
    borderRadius: 5,
    padding: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#003049",
    shadowOpacity: 0.4,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  toastContent: {
    flex: 1,
    marginLeft: 10,
  },
  toastTitle: {
    color: "#F6F4F4",
    fontWeight: "bold",
    fontSize: 16,
  },
  toastMessage: {
    color: "#F6F4F4",
    fontWeight: "500",
    fontSize: 14,
  },
  closeButton: {
    marginLeft: 10,
  },
  progressBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    height: 3,
    backgroundColor: "#FFF",
  },
};