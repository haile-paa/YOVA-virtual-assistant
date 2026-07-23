import { LinearGradient } from "expo-linear-gradient";
import {
  Bell,
  SquareCheck as CheckSquare,
  Clock,
  Circle as HelpCircle,
  Settings,
  StickyNote,
  User,
  LogOut,
  Shield,
  Palette,
  Volume2,
  Vibrate,
} from "lucide-react-native";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
  Switch,
  Modal,
  ActivityIndicator,
  Linking,
} from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useState, useEffect } from "react";

interface MenuItem {
  id: string;
  icon: any;
  label: string;
  color: string;
  route?: string;
  action?: () => void;
}

export default function MoreScreen() {
  const router = useRouter();
  const [userData, setUserData] = useState<any>(null);
  const [settings, setSettings] = useState({
    darkMode: false,
    notifications: true,
    soundEnabled: true,
    vibration: true,
  });
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [loading, setLoading] = useState(false);

  // Define handleLogout first
  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Logout",
        style: "destructive",
        onPress: performLogout,
      },
    ]);
  };

  const performLogout = async () => {
    try {
      setLoading(true);
      // Remove all auth-related data
      await AsyncStorage.multiRemove([
        "userToken",
        "userData",
        "onboardingCompleted",
        "appSettings",
      ]);

      // Redirect to onboarding/login screen
      router.replace("/onboarding");
    } catch (error) {
      console.error("Logout error:", error);
      Alert.alert("Error", "Failed to logout. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Now define menuItems after handleLogout is declared
  const menuItems: MenuItem[] = [
    {
      id: "1",
      icon: User,
      label: "Profile",
      color: "#F5C563",
      route: "/profile",
    },
    {
      id: "2",
      icon: Bell,
      label: "Notifications",
      color: "#E8A93B",
      action: () => toggleSetting("notifications"),
    },
    {
      id: "3",
      icon: Settings,
      label: "Settings",
      color: "#8B7965",
      action: () => setShowSettingsModal(true),
    },
    {
      id: "4",
      icon: HelpCircle,
      label: "Help & Support",
      color: "#BFB5AB",
      action: () => setShowHelpModal(true),
    },
    {
      id: "5",
      icon: LogOut,
      label: "Logout",
      color: "#FF6B6B",
      action: handleLogout,
    },
  ];

  useEffect(() => {
    loadUserData();
    loadSettings();
  }, []);

  const loadUserData = async () => {
    try {
      const userDataString = await AsyncStorage.getItem("userData");
      if (userDataString) {
        setUserData(JSON.parse(userDataString));
      }
    } catch (error) {
      console.error("Error loading user data:", error);
    }
  };

  const loadSettings = async () => {
    try {
      const settingsString = await AsyncStorage.getItem("appSettings");
      if (settingsString) {
        setSettings(JSON.parse(settingsString));
      }
    } catch (error) {
      console.error("Error loading settings:", error);
    }
  };

  const saveSettings = async (newSettings: any) => {
    try {
      await AsyncStorage.setItem("appSettings", JSON.stringify(newSettings));
      setSettings(newSettings);
    } catch (error) {
      console.error("Error saving settings:", error);
    }
  };

  const toggleSetting = (setting: keyof typeof settings) => {
    const newSettings = {
      ...settings,
      [setting]: !settings[setting],
    };
    saveSettings(newSettings);
  };

  const handleMenuItemPress = (item: MenuItem) => {
    if (item.action) {
      item.action();
    } else if (item.route) {
      router.push(item.route as any);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#4A3F35", "#3D3329", "#2D2520"]}
        style={styles.gradient}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>More</Text>
          {userData && (
            <Text style={styles.welcomeText}>
              Welcome, {userData.firstName || "User"}!
            </Text>
          )}
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.menuGrid}>
            {menuItems.map((item) => {
              const IconComponent = item.icon;
              return (
                <TouchableOpacity
                  key={item.id}
                  style={[
                    styles.menuItem,
                    item.id === "5" && styles.logoutItem,
                  ]}
                  onPress={() => handleMenuItemPress(item)}
                  disabled={loading}
                >
                  <View
                    style={[
                      styles.iconContainer,
                      { backgroundColor: `${item.color}20` },
                      item.id === "5" && styles.logoutIconContainer,
                    ]}
                  >
                    {loading && item.id === "5" ? (
                      <ActivityIndicator size='small' color={item.color} />
                    ) : (
                      <IconComponent
                        size={28}
                        color={item.color}
                        strokeWidth={2}
                      />
                    )}
                  </View>
                  <Text
                    style={[
                      styles.menuLabel,
                      item.id === "5" && styles.logoutText,
                    ]}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Quick Settings Panel */}
          <View style={styles.quickSettings}>
            <Text style={styles.sectionTitle}>Quick Settings</Text>
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Bell size={20} color='#F5C563' />
                <Text style={styles.settingLabel}>Notifications</Text>
              </View>
              <Switch
                value={settings.notifications}
                onValueChange={() => toggleSetting("notifications")}
                trackColor={{ false: "#8B7965", true: "#F5C563" }}
                thumbColor={settings.notifications ? "#FFFFFF" : "#FFFFFF"}
              />
            </View>

            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Volume2 size={20} color='#F5C563' />
                <Text style={styles.settingLabel}>Sound</Text>
              </View>
              <Switch
                value={settings.soundEnabled}
                onValueChange={() => toggleSetting("soundEnabled")}
                trackColor={{ false: "#8B7965", true: "#F5C563" }}
                thumbColor={settings.soundEnabled ? "#FFFFFF" : "#FFFFFF"}
              />
            </View>

            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Vibrate size={20} color='#F5C563' />
                <Text style={styles.settingLabel}>Vibration</Text>
              </View>
              <Switch
                value={settings.vibration}
                onValueChange={() => toggleSetting("vibration")}
                trackColor={{ false: "#8B7965", true: "#F5C563" }}
                thumbColor={settings.vibration ? "#FFFFFF" : "#FFFFFF"}
              />
            </View>
          </View>

          <View style={styles.infoSection}>
            <Text style={styles.infoTitle}>About YOVA</Text>
            <Text style={styles.infoText}>
              YOVA is your personal virtual assistant, designed to help you
              manage your tasks, schedule, notes, and more. Use voice commands
              or manual input to stay organized and productive.
            </Text>

            {userData && (
              <View style={styles.userInfo}>
                <Text style={styles.userInfoText}>
                  Logged in as: {userData.email}
                </Text>
                <Text style={styles.userInfoText}>
                  Member since:{" "}
                  {new Date(userData.createdAt).toLocaleDateString()}
                </Text>
                <Text style={styles.userInfoText}>
                  User ID: {userData._id || userData.id}
                </Text>
              </View>
            )}
          </View>
        </ScrollView>

        {/* Settings Modal */}
        <Modal
          visible={showSettingsModal}
          animationType='slide'
          transparent={true}
          onRequestClose={() => setShowSettingsModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Settings</Text>

              <View style={styles.settingGroup}>
                <Text style={styles.settingGroupTitle}>Appearance</Text>
                <View style={styles.settingRow}>
                  <View style={styles.settingInfo}>
                    <Palette size={20} color='#F5C563' />
                    <Text style={styles.settingLabel}>Dark Mode</Text>
                  </View>
                  <Switch
                    value={settings.darkMode}
                    onValueChange={() => toggleSetting("darkMode")}
                    trackColor={{ false: "#8B7965", true: "#F5C563" }}
                    thumbColor={settings.darkMode ? "#FFFFFF" : "#FFFFFF"}
                  />
                </View>
              </View>

              <View style={styles.settingGroup}>
                <Text style={styles.settingGroupTitle}>Notifications</Text>
                <View style={styles.settingRow}>
                  <View style={styles.settingInfo}>
                    <Bell size={20} color='#F5C563' />
                    <Text style={styles.settingLabel}>Push Notifications</Text>
                  </View>
                  <Switch
                    value={settings.notifications}
                    onValueChange={() => toggleSetting("notifications")}
                    trackColor={{ false: "#8B7965", true: "#F5C563" }}
                    thumbColor={settings.notifications ? "#FFFFFF" : "#FFFFFF"}
                  />
                </View>
              </View>

              <View style={styles.settingGroup}>
                <Text style={styles.settingGroupTitle}>Sound & Vibration</Text>
                <View style={styles.settingRow}>
                  <View style={styles.settingInfo}>
                    <Volume2 size={20} color='#F5C563' />
                    <Text style={styles.settingLabel}>Sound Effects</Text>
                  </View>
                  <Switch
                    value={settings.soundEnabled}
                    onValueChange={() => toggleSetting("soundEnabled")}
                    trackColor={{ false: "#8B7965", true: "#F5C563" }}
                    thumbColor={settings.soundEnabled ? "#FFFFFF" : "#FFFFFF"}
                  />
                </View>
                <View style={styles.settingRow}>
                  <View style={styles.settingInfo}>
                    <Vibrate size={20} color='#F5C563' />
                    <Text style={styles.settingLabel}>Vibration</Text>
                  </View>
                  <Switch
                    value={settings.vibration}
                    onValueChange={() => toggleSetting("vibration")}
                    trackColor={{ false: "#8B7965", true: "#F5C563" }}
                    thumbColor={settings.vibration ? "#FFFFFF" : "#FFFFFF"}
                  />
                </View>
              </View>

              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => setShowSettingsModal(false)}
              >
                <Text style={styles.modalButtonText}>Save & Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Help & Support Modal */}
        <Modal
          visible={showHelpModal}
          animationType='slide'
          transparent={true}
          onRequestClose={() => setShowHelpModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Help & Support</Text>

              <View style={styles.helpSection}>
                <Text style={styles.helpTitle}>Getting Started</Text>
                <Text style={styles.helpText}>
                  • Use the AI Assistant for any questions or help
                  {"\n"}• Create tasks and set reminders
                  {"\n"}• Take notes and organize your thoughts
                  {"\n"}• Schedule events with notifications
                </Text>
              </View>

              <View style={styles.helpSection}>
                <Text style={styles.helpTitle}>Need Help?</Text>
                <Text style={styles.helpText}>
                  Contact our support team at:
                </Text>
                <TouchableOpacity
                  onPress={() =>
                    Linking.openURL("mailto:pa.developments@gmail.com")
                  }
                >
                  <Text style={styles.helpEmailLink}>
                    pa.developments@gmail.com
                  </Text>
                </TouchableOpacity>
                <Text style={styles.helpText}>
                  Or chat with our AI assistant for immediate help.
                </Text>
              </View>

              <View style={styles.helpSection}>
                <Text style={styles.helpTitle}>App Version</Text>
                <Text style={styles.helpText}>YOVA v1.0.0</Text>
              </View>

              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => setShowHelpModal(false)}
              >
                <Text style={styles.modalButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </LinearGradient>
    </View>
  );
}

// ... (keep your existing styles exactly the same)
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
    marginBottom: 8,
  },
  welcomeText: {
    fontSize: 16,
    color: "#BFB5AB",
    fontWeight: "500",
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
  logoutItem: {
    backgroundColor: "rgba(255, 107, 107, 0.1)",
    borderColor: "rgba(255, 107, 107, 0.3)",
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  logoutIconContainer: {
    backgroundColor: "rgba(255, 107, 107, 0.2)",
  },
  menuLabel: {
    fontSize: 15,
    fontWeight: "600",
    color: "#FFFFFF",
    textAlign: "center",
  },
  logoutText: {
    color: "#FF6B6B",
  },
  // Quick Settings Styles
  quickSettings: {
    backgroundColor: "rgba(232, 221, 211, 0.1)",
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: "rgba(232, 221, 211, 0.2)",
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#F5C563",
    marginBottom: 16,
  },
  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(139, 121, 101, 0.3)",
  },
  settingInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  settingLabel: {
    fontSize: 16,
    color: "#FFFFFF",
    fontWeight: "500",
  },
  // Info Section
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
    marginBottom: 16,
  },
  userInfo: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(139, 121, 101, 0.3)",
  },
  userInfoText: {
    fontSize: 12,
    color: "#8B7965",
    marginBottom: 4,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#3D3329",
    borderRadius: 20,
    padding: 24,
    width: "100%",
    maxWidth: 400,
    borderWidth: 1,
    borderColor: "rgba(232, 221, 211, 0.2)",
    maxHeight: "80%",
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#F5C563",
    marginBottom: 20,
    textAlign: "center",
  },
  settingGroup: {
    marginBottom: 24,
  },
  settingGroupTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 16,
  },
  modalButton: {
    backgroundColor: "#F5C563",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginTop: 10,
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2D2520",
  },
  // Help Section Styles
  helpSection: {
    marginBottom: 20,
  },
  helpTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 8,
  },
  helpText: {
    fontSize: 14,
    color: "#BFB5AB",
    lineHeight: 20,
  },
  helpEmailLink: {
    fontSize: 14,
    color: "#F5C563",
    fontWeight: "600",
    lineHeight: 20,
    textDecorationLine: "underline",
  },
});
