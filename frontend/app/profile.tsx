import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { ArrowLeft, Save, User, Mail, UserCheck } from "lucide-react-native";
import { useState, useEffect } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  TextInput,
  Alert,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

// API Configuration - Define once, use everywhere
const API_CONFIG = {
  BASE_URL: "http://192.168.1.2:8080/api",
  ENDPOINTS: {
    PROFILE: "/protected/profile",
  },
};

interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export default function ProfileScreen() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
  });

  useEffect(() => {
    loadProfile();
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

    return response;
  };

  const loadProfile = async () => {
    try {
      setLoading(true);
      const token = await getAuthToken();

      if (!token) {
        Alert.alert("Error", "Authentication required");
        router.back();
        return;
      }

      const response = await apiCall(API_CONFIG.ENDPOINTS.PROFILE, {
        method: "GET",
      });

      if (response.ok) {
        const data = await response.json();
        setProfile(data);
        setFormData({
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
        });
      } else {
        const errorData = await response.json();
        Alert.alert("Error", errorData.error || "Failed to load profile");
      }
    } catch (error) {
      console.error("Error loading profile:", error);
      Alert.alert("Error", "Network error while loading profile");
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async () => {
    if (
      !formData.firstName.trim() ||
      !formData.lastName.trim() ||
      !formData.email.trim()
    ) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    try {
      setSaving(true);
      const token = await getAuthToken();

      if (!token) {
        Alert.alert("Error", "Authentication required");
        return;
      }

      const response = await apiCall(API_CONFIG.ENDPOINTS.PROFILE, {
        method: "PUT",
        body: JSON.stringify({
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
          email: formData.email.trim(),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setProfile(data);
        setEditing(false);

        // Update stored user data
        const userDataString = await AsyncStorage.getItem("userData");
        if (userDataString) {
          const userData = JSON.parse(userDataString);
          const updatedUserData = {
            ...userData,
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
          };
          await AsyncStorage.setItem(
            "userData",
            JSON.stringify(updatedUserData)
          );
        }

        Alert.alert("Success", "Profile updated successfully");
      } else {
        const errorData = await response.json();
        Alert.alert("Error", errorData.error || "Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      Alert.alert("Error", "Network error while updating profile");
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    if (profile) {
      setFormData({
        firstName: profile.firstName,
        lastName: profile.lastName,
        email: profile.email,
      });
    }
    setEditing(false);
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <LinearGradient
          colors={["#4A3F35", "#3D3329", "#2D2520"]}
          style={styles.gradient}
        >
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.headerButton}
              onPress={() => router.back()}
            >
              <ArrowLeft size={24} color='#FFFFFF' strokeWidth={2} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Profile</Text>
            <View style={styles.headerButton} />
          </View>
          <View style={styles.loadingContainer}>
            <ActivityIndicator size='large' color='#F5C563' />
            <Text style={styles.loadingText}>Loading profile...</Text>
          </View>
        </LinearGradient>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#4A3F35", "#3D3329", "#2D2520"]}
        style={styles.gradient}
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color='#FFFFFF' strokeWidth={2} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Profile</Text>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={editing ? handleCancelEdit : () => setEditing(true)}
            disabled={saving}
          >
            <Text style={styles.editButtonText}>
              {editing ? "Cancel" : "Edit"}
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Profile Header */}
          <View style={styles.profileHeader}>
            <View style={styles.avatar}>
              <UserCheck size={40} color='#F5C563' />
            </View>
            <Text style={styles.profileName}>
              {profile?.firstName} {profile?.lastName}
            </Text>
            <Text style={styles.profileEmail}>{profile?.email}</Text>
          </View>

          {/* Profile Form */}
          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Personal Information</Text>

            <View style={styles.inputGroup}>
              <View style={styles.inputLabelContainer}>
                <User size={16} color='#8B7965' />
                <Text style={styles.inputLabel}>First Name</Text>
              </View>
              <TextInput
                style={[styles.input, !editing && styles.inputDisabled]}
                value={formData.firstName}
                onChangeText={(text) =>
                  setFormData((prev) => ({ ...prev, firstName: text }))
                }
                editable={editing}
                placeholder='First Name'
                placeholderTextColor='#8B7965'
              />
            </View>

            <View style={styles.inputGroup}>
              <View style={styles.inputLabelContainer}>
                <User size={16} color='#8B7965' />
                <Text style={styles.inputLabel}>Last Name</Text>
              </View>
              <TextInput
                style={[styles.input, !editing && styles.inputDisabled]}
                value={formData.lastName}
                onChangeText={(text) =>
                  setFormData((prev) => ({ ...prev, lastName: text }))
                }
                editable={editing}
                placeholder='Last Name'
                placeholderTextColor='#8B7965'
              />
            </View>

            <View style={styles.inputGroup}>
              <View style={styles.inputLabelContainer}>
                <Mail size={16} color='#8B7965' />
                <Text style={styles.inputLabel}>Email Address</Text>
              </View>
              <TextInput
                style={[styles.input, !editing && styles.inputDisabled]}
                value={formData.email}
                onChangeText={(text) =>
                  setFormData((prev) => ({ ...prev, email: text }))
                }
                editable={editing}
                placeholder='Email Address'
                placeholderTextColor='#8B7965'
                keyboardType='email-address'
                autoCapitalize='none'
              />
            </View>

            {editing && (
              <TouchableOpacity
                style={[styles.saveButton, saving && styles.saveButtonDisabled]}
                onPress={updateProfile}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator size='small' color='#1A1410' />
                ) : (
                  <>
                    <Save size={20} color='#1A1410' />
                    <Text style={styles.saveButtonText}>Save Changes</Text>
                  </>
                )}
              </TouchableOpacity>
            )}
          </View>

          {/* Account Information */}
          {profile && (
            <View style={styles.infoSection}>
              <Text style={styles.sectionTitle}>Account Information</Text>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Member Since</Text>
                <Text style={styles.infoValue}>
                  {new Date(profile.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Last Updated</Text>
                <Text style={styles.infoValue}>
                  {new Date(profile.updatedAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>User ID</Text>
                <Text
                  style={styles.infoValue}
                  numberOfLines={1}
                  ellipsizeMode='middle'
                >
                  {profile.id}
                </Text>
              </View>
            </View>
          )}
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
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  headerButton: {
    width: 60,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  editButtonText: {
    color: "#F5C563",
    fontSize: 16,
    fontWeight: "600",
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: "#F5C563",
    fontSize: 16,
    marginTop: 12,
  },
  profileHeader: {
    alignItems: "center",
    paddingVertical: 30,
    marginBottom: 20,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(245, 197, 99, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    borderWidth: 2,
    borderColor: "#F5C563",
  },
  profileName: {
    fontSize: 24,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 16,
    color: "#BFB5AB",
  },
  formSection: {
    backgroundColor: "rgba(232, 221, 211, 0.1)",
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "rgba(232, 221, 211, 0.2)",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#F5C563",
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabelContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    gap: 8,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#BFB5AB",
  },
  input: {
    backgroundColor: "rgba(139, 121, 101, 0.3)",
    borderColor: "rgba(232, 221, 211, 0.2)",
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: "#FFFFFF",
    fontSize: 16,
  },
  inputDisabled: {
    opacity: 0.7,
  },
  saveButton: {
    backgroundColor: "#F5C563",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 10,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: "#1A1410",
    fontSize: 16,
    fontWeight: "600",
  },
  infoSection: {
    backgroundColor: "rgba(232, 221, 211, 0.1)",
    borderRadius: 20,
    padding: 20,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: "rgba(232, 221, 211, 0.2)",
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(139, 121, 101, 0.3)",
  },
  infoLabel: {
    fontSize: 14,
    color: "#BFB5AB",
    fontWeight: "500",
  },
  infoValue: {
    fontSize: 14,
    color: "#FFFFFF",
    fontWeight: "600",
    flex: 1,
    textAlign: "right",
    marginLeft: 10,
  },
});
