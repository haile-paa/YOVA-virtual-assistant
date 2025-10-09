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
} from "react-native";
import uuid from "react-native-uuid";

interface ScheduleEvent {
  id: string;
  title: string;
  day: string;
  time: string;
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

  // Filter events based on search query
  const filteredEvents = searchQuery
    ? events.filter(
        (event) =>
          event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          event.day.toLowerCase().includes(searchQuery.toLowerCase()) ||
          event.time.toLowerCase().includes(searchQuery.toLowerCase())
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
          require("../assets/alarm.mp3")
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

  const addEvent = () => {
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

    // ✅ Save trimmed values
    const newEvent = {
      id: uuid.v4().toString(),
      title: trimmedTitle,
      day: trimmedDay,
      time: trimmedTime,
    };

    setEvents([...events, newEvent]);
    setTitle("");
    setDay("");
    setTime("");
    setShowInputs(false);
  };

  const deleteEvent = (id: string) => {
    setEvents(events.filter((event) => event.id !== id));
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
              `${event.title} is in 30 minutes`
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
          />
          <TextInput
            placeholder='Day (e.g., Monday)'
            value={day}
            onChangeText={setDay}
            style={styles.input}
            placeholderTextColor='#8B7965'
          />
          <TextInput
            placeholder='Time (e.g., 10:00 AM)'
            value={time}
            onChangeText={setTime}
            style={styles.input}
            placeholderTextColor='#8B7965'
          />
          <TouchableOpacity style={styles.addButton} onPress={addEvent}>
            <Text style={styles.addButtonText}>Add Event</Text>
          </TouchableOpacity>
        </>
      ) : (
        <TouchableOpacity
          style={styles.showInputButton}
          onPress={() => setShowInputs(true)}
        >
          <Text style={styles.showInputText}>+ Add Event</Text>
        </TouchableOpacity>
      )}

      {filteredEvents.length === 0 && searchQuery ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No matching events</Text>
          <Text style={styles.emptySubtext}>Try a different search term</Text>
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
              <TouchableOpacity onPress={() => deleteEvent(event.id)}>
                <MaterialIcons
                  name='delete'
                  size={22}
                  color={index === 0 ? "#F5C563" : "#1A1410"}
                />
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
