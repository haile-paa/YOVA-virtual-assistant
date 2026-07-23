import { MaterialIcons } from "@expo/vector-icons";
import { Audio } from "expo-av";
import Constants from "expo-constants";
import * as Notifications from "expo-notifications";
import React, { useEffect, useState } from "react";
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { handleSessionExpired } from "../utils/session";

// API Configuration - Define once, use everywhere
const API_CONFIG = {
  BASE_URL: "https://yova-virtual-assistant.onrender.com/api",
  ENDPOINTS: {
    EVENTS: "/events",
  },
};

interface ScheduleEvent {
  _id?: string;
  id: string;
  title: string;
  day: string;
  time: string;
  userId?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface ScheduleWidgetProps {
  searchQuery?: string;
}

export default function ScheduleWidget({
  searchQuery = "",
}: ScheduleWidgetProps) {
  const [events, setEvents] = useState<ScheduleEvent[]>([]);
  const [title, setTitle] = useState("");
  const [day, setDay] = useState("");
  const [time, setTime] = useState("");
  const [showInputs, setShowInputs] = useState(true);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  // Fetch events from backend on component mount
  useEffect(() => {
    fetchEvents();
  }, []);

  const getAuthToken = async (): Promise<string | null> => {
    try {
      return await AsyncStorage.getItem("userToken");
    } catch (error) {
      console.error("Error getting auth token:", error);
      return null;
    }
  };

  // Helper function to make API calls
  const apiCall = async (endpoint: string, options: RequestInit = {}) => {
    const token = await getAuthToken();

    const defaultOptions: RequestInit = {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        ...options.headers,
      },
    };

    const response = await fetch(`${API_CONFIG.BASE_URL}${endpoint}`, {
      ...defaultOptions,
      ...options,
    });

    if (response.status === 401) {
      // Session expired or token invalid - clear it and send the user
      // back to onboarding/login. This is an expected, routine condition,
      // so we don't surface it as an error to the user.
      await handleSessionExpired();
    }

    return response;
  };

  const fetchEvents = async () => {
    try {
      setFetching(true);
      const token = await getAuthToken();

      if (!token) {
        console.log("No auth token found");
        setFetching(false);
        return;
      }

      const response = await apiCall(API_CONFIG.ENDPOINTS.EVENTS, {
        method: "GET",
      });

      if (response.ok) {
        const data = await response.json();
        // Transform backend data to match frontend interface
        const transformedEvents = data.map((event: any) => ({
          id: event._id || event.id,
          _id: event._id,
          title: event.title,
          day: event.day,
          time: event.time,
          userId: event.userId,
          createdAt: event.createdAt,
          updatedAt: event.updatedAt,
        }));
        setEvents(transformedEvents);
      } else if (response.status !== 401) {
        console.error("Failed to fetch events:", response.status);
      }
    } catch (error) {
      console.error("Error fetching events:", error);
      Alert.alert("Error", "Failed to load events");
    } finally {
      setFetching(false);
    }
  };

  const createEventInBackend = async (event: {
    title: string;
    day: string;
    time: string;
  }): Promise<ScheduleEvent | null> => {
    try {
      const token = await getAuthToken();
      if (!token) {
        Alert.alert("Error", "Authentication required");
        return null;
      }

      const response = await apiCall(API_CONFIG.ENDPOINTS.EVENTS, {
        method: "POST",
        body: JSON.stringify({
          title: event.title,
          day: event.day,
          time: event.time,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        return {
          id: data._id || data.id,
          _id: data._id,
          title: data.title,
          day: data.day,
          time: data.time,
          userId: data.userId,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
        };
      } else {
        const errorData = await response.json();
        Alert.alert("Error", errorData.message || "Failed to create event");
        return null;
      }
    } catch (error) {
      console.error("Error creating event:", error);
      Alert.alert("Error", "Network error while creating event");
      return null;
    }
  };

  const deleteEventInBackend = async (id: string): Promise<boolean> => {
    try {
      const token = await getAuthToken();
      if (!token) {
        Alert.alert("Error", "Authentication required");
        return false;
      }

      const response = await apiCall(`${API_CONFIG.ENDPOINTS.EVENTS}/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        return true;
      } else {
        const errorData = await response.json();
        Alert.alert("Error", errorData.message || "Failed to delete event");
        return false;
      }
    } catch (error) {
      console.error("Error deleting event:", error);
      Alert.alert("Error", "Network error while deleting event");
      return false;
    }
  };

  // Filter events based on search query
  const filteredEvents = searchQuery
    ? events.filter(
        (event) =>
          event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          event.day.toLowerCase().includes(searchQuery.toLowerCase()) ||
          event.time.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : events;

  // ✅ Environment Detection
  const isExpoGo = Constants.appOwnership === "expo";

  // Load alarm sound only if NOT in Expo Go
  useEffect(() => {
    if (isExpoGo) return;

    (async () => {
      try {
        const { sound } = await Audio.Sound.createAsync(
          require("../assets/alarm.mp3"),
        );
        setSound(sound);
      } catch (error) {
        // Silent catch
      }
    })();
  }, [isExpoGo]);

  // Clean up sound
  useEffect(() => {
    if (!sound) return;
    return () => {
      sound.unloadAsync().catch(() => {}); // Silent catch
    };
  }, [sound]);

  const addEvent = async () => {
    // ✅ TRIM THE INPUTS to remove spaces
    const trimmedTitle = title.trim();
    const trimmedDay = day.trim();
    const trimmedTime = time.trim();

    if (!trimmedTitle || !trimmedDay || !trimmedTime) {
      Alert.alert("Missing info", "Please fill in all fields.");
      return;
    }

    const timeRegex = /^([0-9]{1,2}):([0-9]{2})\s?(AM|PM)$/i;
    if (!timeRegex.test(trimmedTime)) {
      Alert.alert("Invalid time", "Use format like 10:30 AM or 03:15 PM.");
      return;
    }

    setLoading(true);
    try {
      const eventData = {
        title: trimmedTitle,
        day: trimmedDay,
        time: trimmedTime,
      };

      const createdEvent = await createEventInBackend(eventData);

      if (createdEvent) {
        setEvents([...events, createdEvent]);
        setTitle("");
        setDay("");
        setTime("");
        setShowInputs(false);
      }
    } catch (error) {
      console.error("Error in addEvent:", error);
    } finally {
      setLoading(false);
    }
  };

  const deleteEvent = async (id: string) => {
    setLoading(true);
    try {
      const success = await deleteEventInBackend(id);
      if (success) {
        setEvents(events.filter((event) => event.id !== id));
      }
    } catch (error) {
      console.error("Error in deleteEvent:", error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Safe playAlarm function
  const playAlarm = async () => {
    Alert.alert("Time's up!", "Your scheduled event is now!");

    if (isExpoGo || !sound) return;

    try {
      await sound.replayAsync();
    } catch (err) {
      // Silent catch
    }
  };

  // ✅ Safe scheduleNotification function
  const scheduleNotification = async (title: string, body: string) => {
    if (isExpoGo) return;

    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
        },
        trigger: null,
      });
    } catch (error) {
      // Silent catch
    }
  };

  // ✅ Clean time calculation function
  const getTimeLeft = (event: ScheduleEvent) => {
    const now = new Date();

    // ✅ TRIM the event day and get current day
    const eventDay = event.day.trim();
    const currentDayName = now.toLocaleDateString("en-US", { weekday: "long" });

    // If it's not the same day, just return next occurrence
    if (eventDay.toLowerCase() !== currentDayName.toLowerCase()) {
      return `Next ${eventDay}`;
    }

    // Parse event time
    const timeMatch = event.time.match(/(\d+):(\d+)\s?(AM|PM)/i);
    if (!timeMatch) return `Next ${eventDay}`;

    const [, eventHour, eventMinute, ampm] = timeMatch;

    // Convert to 24-hour format
    let eventHour24 = parseInt(eventHour);
    if (ampm.toUpperCase() === "PM" && eventHour24 !== 12) {
      eventHour24 += 12;
    }
    if (ampm.toUpperCase() === "AM" && eventHour24 === 12) {
      eventHour24 = 0;
    }

    // Create event time for today
    const eventTime = new Date();
    eventTime.setHours(eventHour24, parseInt(eventMinute), 0, 0);

    // Calculate difference in minutes
    const diffMs = eventTime.getTime() - now.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));

    // If event time has passed today
    if (diffMinutes < 0) {
      return "Time passed today";
    }

    // Format remaining time
    if (diffMinutes === 0) {
      return "Now!";
    } else if (diffMinutes < 60) {
      return `Today in ${diffMinutes}m`;
    } else {
      const hours = Math.floor(diffMinutes / 60);
      const minutes = diffMinutes % 60;
      return `Today in ${hours}h ${minutes}m`;
    }
  };

  // ✅ Clean schedule checker
  useEffect(() => {
    const interval = setInterval(async () => {
      const now = new Date();
      const currentDayName = now.toLocaleDateString("en-US", {
        weekday: "long",
      });

      events.forEach(async (event) => {
        // ✅ TRIM the event day for comparison
        const eventDay = event.day.trim();

        // Only check events for today
        if (eventDay.toLowerCase() === currentDayName.toLowerCase()) {
          const timeMatch = event.time.match(/(\d+):(\d+)\s?(AM|PM)/i);
          if (!timeMatch) return;

          const [, eventHour, eventMinute, ampm] = timeMatch;

          // Convert to 24-hour format
          let eventHour24 = parseInt(eventHour);
          if (ampm.toUpperCase() === "PM" && eventHour24 !== 12) {
            eventHour24 += 12;
          }
          if (ampm.toUpperCase() === "AM" && eventHour24 === 12) {
            eventHour24 = 0;
          }

          // Calculate current time and event time in minutes since midnight
          const nowMinutes = now.getHours() * 60 + now.getMinutes();
          const eventMinutes = eventHour24 * 60 + parseInt(eventMinute);
          const diff = eventMinutes - nowMinutes;

          // Trigger at exact time
          if (diff === 0) {
            playAlarm();
          }

          // Notify 30 minutes before
          if (diff === 30) {
            await scheduleNotification(
              "Upcoming Event",
              `${event.title} is in 30 minutes`,
            );
          }
        }
      });
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [events, sound]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Schedule</Text>

      {showInputs ? (
        <>
          <TextInput
            placeholder='Event title'
            value={title}
            onChangeText={setTitle}
            style={styles.input}
            placeholderTextColor='#8B7965'
            editable={!loading}
          />
          <TextInput
            placeholder='Day (e.g., Monday)'
            value={day}
            onChangeText={setDay}
            style={styles.input}
            placeholderTextColor='#8B7965'
            editable={!loading}
          />
          <TextInput
            placeholder='Time (e.g., 10:00 AM)'
            value={time}
            onChangeText={setTime}
            style={styles.input}
            placeholderTextColor='#8B7965'
            editable={!loading}
          />
          <TouchableOpacity
            style={[styles.addButton, loading && styles.disabledButton]}
            onPress={addEvent}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size='small' color='#F5C563' />
            ) : (
              <Text style={styles.addButtonText}>Add Event</Text>
            )}
          </TouchableOpacity>
        </>
      ) : (
        <TouchableOpacity
          style={styles.showInputButton}
          onPress={() => setShowInputs(true)}
          disabled={loading}
        >
          <Text style={styles.showInputText}>+ Add Event</Text>
        </TouchableOpacity>
      )}

      {fetching ? (
        <View style={styles.loadingState}>
          <ActivityIndicator size='small' color='#8B7965' />
          <Text style={styles.loadingText}>Loading events...</Text>
        </View>
      ) : filteredEvents.length === 0 && searchQuery ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No matching events</Text>
          <Text style={styles.emptySubtext}>Try a different search term</Text>
        </View>
      ) : filteredEvents.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No events yet</Text>
          <Text style={styles.emptySubtext}>Add your first event!</Text>
        </View>
      ) : (
        filteredEvents.map((event, index) => (
          <View
            key={event.id}
            style={[
              styles.eventCard,
              index === 0 ? styles.eventCardDark : styles.eventCardLight,
            ]}
          >
            <View style={styles.eventRow}>
              <View>
                <Text style={[styles.time, index === 0 && styles.timeDark]}>
                  {event.day}, {event.time} ({getTimeLeft(event)})
                </Text>
                <Text
                  style={[
                    styles.eventTitle,
                    index === 0 && styles.eventTitleDark,
                  ]}
                >
                  {event.title}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => deleteEvent(event.id)}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator
                    size='small'
                    color={index === 0 ? "#F5C563" : "#1A1410"}
                  />
                ) : (
                  <MaterialIcons
                    name='delete'
                    size={22}
                    color={index === 0 ? "#F5C563" : "#1A1410"}
                  />
                )}
              </TouchableOpacity>
            </View>
          </View>
        ))
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#E8DDD3",
    borderRadius: 24,
    padding: 20,
    width: 200,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1A1410",
    marginBottom: 16,
  },
  input: {
    backgroundColor: "#D4C4B8",
    borderRadius: 12,
    padding: 10,
    marginBottom: 10,
    color: "#1A1410",
  },
  addButton: {
    backgroundColor: "#1A1410",
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: "center",
    marginBottom: 20,
  },
  disabledButton: {
    opacity: 0.6,
  },
  addButtonText: { color: "#F5C563", fontWeight: "700" },
  showInputButton: { alignSelf: "flex-start", marginBottom: 16 },
  showInputText: { color: "#1A1410", fontWeight: "700", fontSize: 16 },
  eventCard: { borderRadius: 16, padding: 16, marginBottom: 12 },
  eventCardDark: { backgroundColor: "#1A1410" },
  eventCardLight: { backgroundColor: "#D4C4B8" },
  time: { fontSize: 12, fontWeight: "600", color: "#8B7965", marginBottom: 4 },
  timeDark: { color: "#F5C563" },
  eventTitle: { fontSize: 16, fontWeight: "600", color: "#1A1410" },
  eventTitleDark: { color: "#FFFFFF" },
  eventRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  loadingState: {
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  loadingText: {
    fontSize: 12,
    color: "#8B7965",
    marginTop: 8,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  emptyText: {
    fontSize: 14,
    color: "#8B7965",
    textAlign: "center",
    fontStyle: "italic",
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 12,
    color: "#8B7965",
    textAlign: "center",
  },
});
