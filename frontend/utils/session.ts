import AsyncStorage from "@react-native-async-storage/async-storage";

// Lightweight event bus so any widget can announce "the session just expired"
// and the root layout can react by sending the user back to onboarding/login,
// without needing prop drilling or a full state management library.

type Listener = () => void;

const listeners: Listener[] = [];

export function onSessionExpired(listener: Listener): () => void {
  listeners.push(listener);
  return () => {
    const index = listeners.indexOf(listener);
    if (index > -1) listeners.splice(index, 1);
  };
}

let isHandling = false;

/**
 * Call this whenever an API call comes back with a 401.
 * Clears the stored (expired/invalid) credentials and notifies
 * the root layout so it can show the onboarding/login screen again.
 * Guarded so multiple widgets hitting 401 at the same time only
 * trigger one clear + redirect instead of racing each other.
 */
export async function handleSessionExpired(): Promise<void> {
  if (isHandling) return;
  isHandling = true;

  try {
    await AsyncStorage.multiRemove(["userToken", "userData"]);
    listeners.forEach((listener) => listener());
  } catch (error) {
    console.error("Error handling session expiration:", error);
  } finally {
    // Reset shortly after so a future session expiration can be handled again.
    setTimeout(() => {
      isHandling = false;
    }, 1000);
  }
}
