import VoiceVisualizer from "@/components/VoiceVisualizer";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import {
  ArrowLeft,
  MessageCircle,
  Mic,
  MoreVertical,
  X,
} from "lucide-react-native";
import { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const actions = [
  { id: "1", icon: "📅", label: "Schedule meetings", color: "#8B7965" },
  { id: "2", icon: "⏰", label: "Set reminders", color: "#8B7965" },
  { id: "3", icon: "📝", label: "Take notes", color: "#8B7965" },
  { id: "4", icon: "✅", label: "Create To-Do list", color: "#4CAF50" },
  { id: "5", icon: "🏠", label: "Control smart appl", color: "#8B7965" },
];

export default function AssistantScreen() {
  const [isListening, setIsListening] = useState(false);
  const [transcription, setTranscription] = useState(
    "Listening... How can I assist you today?"
  );

  const handleMicPress = () => {
    setIsListening(!isListening);
    if (!isListening) {
      setTranscription("Listening... How can I assist you today?");
    } else {
      setTranscription("");
    }
  };

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
          <Text style={styles.headerTitle}>Talk with YoVA</Text>
          <TouchableOpacity style={styles.headerButton}>
            <MoreVertical size={24} color='#FFFFFF' strokeWidth={2} />
          </TouchableOpacity>
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.visualizerContainer}>
            <VoiceVisualizer isActive={isListening} />
          </View>

          {transcription ? (
            <Text style={styles.transcription}>{transcription}</Text>
          ) : null}

          <View style={styles.actionsGrid}>
            {actions.map((action) => (
              <TouchableOpacity
                key={action.id}
                style={[
                  styles.actionButton,
                  action.id === "5" && styles.actionButtonActive,
                ]}
              >
                <Text style={styles.actionIcon}>{action.icon}</Text>
                <Text
                  style={[
                    styles.actionLabel,
                    action.id === "5" && styles.actionLabelActive,
                  ]}
                >
                  {action.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity style={styles.footerButton}>
            <MessageCircle size={24} color='#FFFFFF' strokeWidth={2} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.micButton, isListening && styles.micButtonActive]}
            onPress={handleMicPress}
          >
            <Mic size={32} color='#1A1410' strokeWidth={2.5} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.footerButton}>
            <X size={24} color='#FFFFFF' strokeWidth={2} />
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
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  headerButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  content: {
    alignItems: "center",
    paddingHorizontal: 24,
    paddingBottom: 120,
  },
  visualizerContainer: {
    marginTop: 40,
    marginBottom: 32,
  },
  transcription: {
    fontSize: 24,
    fontWeight: "400",
    color: "#FFFFFF",
    textAlign: "center",
    marginBottom: 40,
    paddingHorizontal: 20,
    lineHeight: 32,
  },
  actionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    justifyContent: "center",
    width: "100%",
  },
  actionButton: {
    backgroundColor: "rgba(139, 121, 101, 0.3)",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: "rgba(232, 221, 211, 0.2)",
  },
  actionButtonActive: {
    backgroundColor: "rgba(76, 175, 80, 0.3)",
    borderColor: "#4CAF50",
  },
  actionIcon: {
    fontSize: 18,
  },
  actionLabel: {
    fontSize: 14,
    color: "#E8DDD3",
    fontWeight: "500",
  },
  actionLabelActive: {
    color: "#FFFFFF",
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingVertical: 24,
    paddingBottom: 40,
    backgroundColor: "rgba(26, 20, 16, 0.5)",
  },
  footerButton: {
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  micButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#F5C563",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#F5C563",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
  },
  micButtonActive: {
    backgroundColor: "#E8A93B",
  },
});
