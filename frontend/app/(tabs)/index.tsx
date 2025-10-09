import IdeaCard from "@/components/IdeaCard";
import NotesWidget from "@/components/NotesWidget";
import ScheduleWidget from "@/components/ScheduleWidget";
import TasksWidget from "@/components/TasksWidget";
import { LinearGradient } from "expo-linear-gradient";
import { ArrowRight, Calendar, Search } from "lucide-react-native";
import { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function HomeScreen() {
  const [searchQuery, setSearchQuery] = useState("");

  const getCurrentDate = () => {
    const date = new Date();
    const options: Intl.DateTimeFormatOptions = {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "2-digit",
    };
    return date.toLocaleDateString("en-US", options);
  };

  const clearSearch = () => {
    setSearchQuery("");
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#4A3F35", "#3D3329", "#2D2520"]}
        style={styles.gradient}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.logo}>YOVA</Text>
            <Text style={styles.subtitle}>Your Virtual Assistant</Text>
          </View>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>H</Text>
          </View>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.welcomeSection}>
            <Text style={styles.welcomeText}>Welcome Back!</Text>
            <Text style={styles.userName}>Haile</Text>

            <View style={styles.dateRow}>
              <Calendar size={16} color='#F5C563' strokeWidth={2} />
              <Text style={styles.dateText}>Today, {getCurrentDate()}</Text>
              <ArrowRight size={16} color='#F5C563' strokeWidth={2} />
            </View>
          </View>

          {/* Search Bar with Functionality */}
          <View style={styles.searchContainer}>
            <View style={styles.searchInputContainer}>
              <Search size={20} color='#8B7965' strokeWidth={2} />
              <TextInput
                style={styles.searchInput}
                placeholder='Search tasks, notes, events...'
                placeholderTextColor='#8B7965'
                value={searchQuery}
                onChangeText={setSearchQuery}
                returnKeyType='search'
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity
                  onPress={clearSearch}
                  style={styles.clearButton}
                >
                  <Text style={styles.clearButtonText}>✕</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          <View style={styles.widgetsRow}>
            <ScheduleWidget searchQuery={searchQuery} />
            <NotesWidget searchQuery={searchQuery} />
          </View>

          <View style={styles.ideaSection}>
            <IdeaCard searchQuery={searchQuery} />
          </View>

          <View style={styles.tasksSection}>
            <TasksWidget searchQuery={searchQuery} />
          </View>
        </ScrollView>
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
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 20,
  },
  logo: {
    fontSize: 24,
    fontWeight: "700",
    color: "#F5C563",
  },
  subtitle: {
    fontSize: 12,
    color: "#BFB5AB",
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#F5C563",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1A1410",
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 100,
  },
  welcomeSection: {
    marginBottom: 20,
  },
  welcomeText: {
    fontSize: 32,
    color: "#E8DDD3",
    fontWeight: "300",
  },
  userName: {
    fontSize: 36,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 12,
  },
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  dateText: {
    fontSize: 14,
    color: "#BFB5AB",
  },
  searchContainer: {
    backgroundColor: "rgba(232, 221, 211, 0.1)",
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "rgba(232, 221, 211, 0.2)",
  },
  searchInputContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  searchInput: {
    flex: 1,
    color: "#E8DDD3",
    fontSize: 16,
    marginLeft: 12,
    paddingVertical: 4,
  },
  clearButton: {
    padding: 4,
    marginLeft: 8,
  },
  clearButtonText: {
    color: "#8B7965",
    fontSize: 16,
    fontWeight: "bold",
  },
  widgetsRow: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 16,
  },
  ideaSection: {
    marginBottom: 16,
  },
  tasksSection: {
    marginBottom: 24,
  },
});
