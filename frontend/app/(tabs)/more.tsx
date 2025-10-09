import { LinearGradient } from "expo-linear-gradient";
import {
  Bell,
  Calendar,
  SquareCheck as CheckSquare,
  Clock,
  Circle as HelpCircle,
  Settings,
  StickyNote,
  User,
} from "lucide-react-native";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const menuItems = [
  { id: "1", icon: User, label: "Profile", color: "#F5C563" },
  { id: "2", icon: Calendar, label: "My Schedule", color: "#E8A93B" },
  { id: "3", icon: CheckSquare, label: "All Tasks", color: "#4CAF50" },
  { id: "4", icon: StickyNote, label: "My Notes", color: "#D4922A" },
  { id: "5", icon: Clock, label: "Reminders", color: "#8B7965" },
  { id: "6", icon: Bell, label: "Notifications", color: "#E8A93B" },
  { id: "7", icon: Settings, label: "Settings", color: "#8B7965" },
  { id: "8", icon: HelpCircle, label: "Help & Support", color: "#BFB5AB" },
];

export default function MoreScreen() {
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#4A3F35", "#3D3329", "#2D2520"]}
        style={styles.gradient}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>More</Text>
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.menuGrid}>
            {menuItems.map((item) => {
              const IconComponent = item.icon;
              return (
                <TouchableOpacity key={item.id} style={styles.menuItem}>
                  <View
                    style={[
                      styles.iconContainer,
                      { backgroundColor: `${item.color}20` },
                    ]}
                  >
                    <IconComponent
                      size={28}
                      color={item.color}
                      strokeWidth={2}
                    />
                  </View>
                  <Text style={styles.menuLabel}>{item.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.infoSection}>
            <Text style={styles.infoTitle}>About YOVA</Text>
            <Text style={styles.infoText}>
              YOVA is your personal virtual assistant, designed to help you
              manage your tasks, schedule, notes, and more. Use voice commands
              or manual input to stay organized and productive.
            </Text>
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
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  content: {
    paddingHorizontal: 24,
    paddingBottom: 100,
  },
  menuGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
    marginBottom: 32,
  },
  menuItem: {
    width: "47%",
    backgroundColor: "rgba(232, 221, 211, 0.1)",
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(232, 221, 211, 0.2)",
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  menuLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: "#FFFFFF",
    textAlign: "center",
  },
  infoSection: {
    backgroundColor: "rgba(232, 221, 211, 0.1)",
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(232, 221, 211, 0.2)",
  },
  infoTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#F5C563",
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: "#BFB5AB",
    lineHeight: 22,
  },
});
