import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  TextInput,
  Alert,
  Image,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";

const { width: screenWidth } = Dimensions.get("window");

interface OnboardingScreenProps {
  onComplete?: () => void;
}

export default function OnboardingScreen({
  onComplete,
}: OnboardingScreenProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const router = useRouter();

  const slides = [
    {
      title: "YOVA Assistant",
      subtitle: "AI chat bot &\n task manager",
      buttonText: "Get Started",
    },
    {
      title: isLogin ? "Welcome Back!" : "Create Account",
      subtitle: isLogin ? "Sign in to continue" : "Join us to get started",
      buttonText: isLogin ? "Sign In" : "Sign Up",
    },
  ];

  const handleAuth = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    if (!isLogin && (!firstName || !lastName)) {
      Alert.alert("Error", "Please enter your first and last name");
      return;
    }

    setLoading(true);

    try {
      const authData = {
        email,
        password,
        ...(isLogin ? {} : { firstName, lastName }),
      };

      const response = await fetch(
        "https://yova-virtual-assistant.onrender.com/api/" +
          (isLogin ? "login" : "signup"),
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(authData),
        },
      );

      const data = await response.json();

      if (response.ok) {
        await AsyncStorage.setItem("userToken", data.token);
        await AsyncStorage.setItem("userData", JSON.stringify(data.user));
        await AsyncStorage.setItem("onboardingCompleted", "true");
        onComplete?.();
        router.replace("/");
      } else {
        Alert.alert("Error", data.message || "Authentication failed");
      }
    } catch (error) {
      console.error("Auth error:", error);
      Alert.alert("Error", "Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleNext = async () => {
    if (currentSlide === 0) {
      scrollViewRef.current?.scrollTo({ x: screenWidth, animated: true });
      setCurrentSlide(1);
    } else if (currentSlide === 1) {
      await handleAuth();
    }
  };

  const handleSkip = async () => {
    setLoading(true);
    try {
      // Just mark onboarding as completed without any user data
      await AsyncStorage.setItem("onboardingCompleted", "true");
      // Redirect to home screen without token
      onComplete?.();
      router.replace("/");
    } catch (error) {
      console.error("Skip error:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleAuthMode = () => {
    if (loading) return;

    setIsLogin(!isLogin);
    setFirstName("");
    setLastName("");
    setEmail("");
    setPassword("");
  };

  const handleScroll = (event: any) => {
    const slideIndex = Math.round(
      event.nativeEvent.contentOffset.x / screenWidth,
    );
    setCurrentSlide(slideIndex);
  };

  const getButtonText = () => {
    if (loading) {
      return isLogin ? "Signing In..." : "Creating Account...";
    }
    return slides[currentSlide].buttonText;
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#4A3F35", "#3D3329", "#2D2520"]}
        style={styles.gradient}
      >
        {/* Skip Button - Only show on first slide */}
        {currentSlide === 0 && (
          <TouchableOpacity
            style={[styles.skipButton, loading && styles.disabledButton]}
            onPress={handleSkip}
            disabled={loading}
          >
            <Text style={styles.skipText}>
              {loading ? "Loading..." : "Skip"}
            </Text>
          </TouchableOpacity>
        )}

        <ScrollView
          ref={scrollViewRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          style={styles.scrollView}
        >
          {/* Slide 1: Welcome */}
          <View style={[styles.slide, { width: screenWidth }]}>
            <View style={styles.content}>
              <Image
                source={require("../assets/gifs/Chatbot1-ezgif.com-resize.gif")}
                style={styles.gif}
                resizeMode='contain'
              />
              <Text style={styles.title}>{slides[0].title}</Text>
              <Text style={styles.subtitle}>{slides[0].subtitle}</Text>
            </View>
          </View>

          {/* Slide 2: Authentication */}
          <View style={[styles.slide, { width: screenWidth }]}>
            <View style={styles.content}>
              <Text style={styles.title}>{slides[1].title}</Text>
              <Text style={styles.subtitle}>{slides[1].subtitle}</Text>

              {!isLogin && (
                <View style={styles.nameContainer}>
                  <TextInput
                    style={[styles.nameInput, loading && styles.disabledInput]}
                    placeholder='First Name'
                    placeholderTextColor='#8B7965'
                    value={firstName}
                    onChangeText={setFirstName}
                    autoCapitalize='words'
                    editable={!loading}
                  />
                  <TextInput
                    style={[styles.nameInput, loading && styles.disabledInput]}
                    placeholder='Last Name'
                    placeholderTextColor='#8B7965'
                    value={lastName}
                    onChangeText={setLastName}
                    autoCapitalize='words'
                    editable={!loading}
                  />
                </View>
              )}

              <TextInput
                style={[styles.input, loading && styles.disabledInput]}
                placeholder='Email'
                placeholderTextColor='#8B7965'
                value={email}
                onChangeText={setEmail}
                keyboardType='email-address'
                autoCapitalize='none'
                editable={!loading}
              />

              <TextInput
                style={[styles.input, loading && styles.disabledInput]}
                placeholder='Password'
                placeholderTextColor='#8B7965'
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                editable={!loading}
              />

              <TouchableOpacity
                style={[
                  styles.toggleAuthButton,
                  loading && styles.disabledButton,
                ]}
                onPress={toggleAuthMode}
                disabled={loading}
              >
                <Text style={styles.toggleAuthText}>
                  {isLogin
                    ? "Don't have an account? Sign Up"
                    : "Already have an account? Sign In"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>

        {/* Bottom Section */}
        <View style={styles.bottomSection}>
          {/* Pagination Dots */}
          <View style={styles.pagination}>
            {slides.map((_, index) => (
              <View
                key={index}
                style={[styles.dot, currentSlide === index && styles.activeDot]}
              />
            ))}
          </View>

          {/* Action Button */}
          <TouchableOpacity
            style={[styles.button, loading && styles.loadingButton]}
            onPress={handleNext}
            disabled={loading}
          >
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size='small' color='#1A1410' />
                <Text style={styles.buttonText}>{getButtonText()}</Text>
              </View>
            ) : (
              <Text style={styles.buttonText}>{getButtonText()}</Text>
            )}
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  skipButton: {
    position: "absolute",
    top: 60,
    right: 24,
    zIndex: 10,
  },
  skipText: {
    color: "#F5C563",
    fontSize: 16,
    fontWeight: "600",
  },
  scrollView: {
    flex: 1,
  },
  slide: {
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  content: {
    alignItems: "center",
    width: "100%",
  },
  gif: {
    width: 200,
    height: 200,
    marginBottom: 30,
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    color: "#FFFFFF",
    textAlign: "center",
    lineHeight: 40,
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    color: "#BFB5AB",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 40,
  },
  // New styles for name container and inputs
  nameContainer: {
    flexDirection: "row",
    width: "100%",
    gap: 12,
  },
  nameInput: {
    flex: 1,
    height: 50,
    backgroundColor: "rgba(232, 221, 211, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(232, 221, 211, 0.2)",
    borderRadius: 12,
    paddingHorizontal: 16,
    color: "#E8DDD3",
    fontSize: 16,
    marginTop: 12,
  },
  input: {
    width: "100%",
    height: 50,
    backgroundColor: "rgba(232, 221, 211, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(232, 221, 211, 0.2)",
    borderRadius: 12,
    paddingHorizontal: 16,
    color: "#E8DDD3",
    fontSize: 16,
    marginTop: 12,
  },
  disabledInput: {
    opacity: 0.6,
  },
  toggleAuthButton: {
    marginTop: 16,
    padding: 8,
  },
  toggleAuthText: {
    color: "#F5C563",
    fontSize: 14,
    fontWeight: "500",
    textAlign: "center",
  },
  bottomSection: {
    paddingHorizontal: 24,
    paddingBottom: 60,
    paddingTop: 20,
  },
  pagination: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 30,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#8B7965",
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: "#F5C563",
    width: 20,
  },
  button: {
    backgroundColor: "#F5C563",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  loadingButton: {
    opacity: 0.8,
  },
  disabledButton: {
    opacity: 0.5,
  },
  buttonText: {
    color: "#1A1410",
    fontSize: 18,
    fontWeight: "600",
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
});
