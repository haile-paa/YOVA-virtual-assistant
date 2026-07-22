import { Stack } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import OnboardingScreen from "./onboarding";
import { onSessionExpired } from "../utils/session";

export default function RootLayout() {
  const [isLoading, setIsLoading] = useState(true);
  const [isOnboardingComplete, setIsOnboardingComplete] = useState(false);
  const [userToken, setUserToken] = useState<string | null>(null);

  useEffect(() => {
    checkAuthStatus();

    // If a widget detects an expired/invalid token (401), it clears storage
    // and emits this event. React by dropping the token from state, which
    // sends the user back to the onboarding/login screen automatically.
    const unsubscribe = onSessionExpired(() => {
      setUserToken(null);
    });

    return unsubscribe;
  }, []);

  const checkAuthStatus = async () => {
    try {
      const [onboardingCompleted, token] = await Promise.all([
        AsyncStorage.getItem("onboardingCompleted"),
        AsyncStorage.getItem("userToken"),
      ]);

      setIsOnboardingComplete(onboardingCompleted === "true");
      setUserToken(token);
    } catch (error) {
      console.error("Error checking auth status:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOnboardingComplete = () => {
    // Re-read both flags from storage - onboarding may have just saved a
    // new token (login/signup) or none at all (skip), so a plain
    // isOnboardingComplete flip isn't enough on its own.
    checkAuthStatus();
  };

  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#4A3F35",
        }}
      >
        <ActivityIndicator size='large' color='#F5C563' />
      </View>
    );
  }

  // Show onboarding if not completed or no user token
  if (!isOnboardingComplete || !userToken) {
    return <OnboardingScreen onComplete={handleOnboardingComplete} />;
  }

  // Show main app if authenticated
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name='(tabs)' options={{ headerShown: false }} />
    </Stack>
  );
}
