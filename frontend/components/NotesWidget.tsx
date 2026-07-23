import { MaterialIcons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import React, { useState, useEffect } from "react";
import {
  Animated,
  Easing,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  Alert,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { handleSessionExpired } from "../utils/session";

// API Configuration - Define once, use everywhere
const API_CONFIG = {
  BASE_URL: "https://yova-virtual-assistant.onrender.com/api",
  ENDPOINTS: {
    NOTES: "/notes",
  },
};

interface Note {
  _id?: string;
  id: string;
  title: string;
  content: string;
  userId?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface NotesWidgetProps {
  searchQuery?: string;
}

export default function NotesWidget({ searchQuery = "" }: NotesWidgetProps) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [expandedNote, setExpandedNote] = useState<Note | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState("");
  const [editedContent, setEditedContent] = useState("");
  const [scaleAnim] = useState(new Animated.Value(1));
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  // Fetch notes from backend on component mount
  useEffect(() => {
    fetchNotes();
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

  const fetchNotes = async () => {
    try {
      setFetching(true);
      const token = await getAuthToken();

      if (!token) {
        console.log("No auth token found");
        setFetching(false);
        return;
      }

      const response = await apiCall(API_CONFIG.ENDPOINTS.NOTES, {
        method: "GET",
      });

      if (response.ok) {
        const data = await response.json();
        // Transform backend data to match frontend interface
        const transformedNotes = data.map((note: any) => ({
          id: note._id || note.id,
          _id: note._id,
          title: note.title,
          content: note.content,
          userId: note.userId,
          createdAt: note.createdAt,
          updatedAt: note.updatedAt,
        }));
        setNotes(transformedNotes);
      } else if (response.status !== 401) {
        console.error("Failed to fetch notes:", response.status);
      }
    } catch (error) {
      console.error("Error fetching notes:", error);
      Alert.alert("Error", "Failed to load notes");
    } finally {
      setFetching(false);
    }
  };

  const createNoteInBackend = async (note: {
    title: string;
    content: string;
  }): Promise<Note | null> => {
    try {
      const token = await getAuthToken();
      if (!token) {
        Alert.alert("Error", "Authentication required");
        return null;
      }

      const response = await apiCall(API_CONFIG.ENDPOINTS.NOTES, {
        method: "POST",
        body: JSON.stringify({
          title: note.title,
          content: note.content,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        return {
          id: data._id || data.id,
          _id: data._id,
          title: data.title,
          content: data.content,
          userId: data.userId,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
        };
      } else {
        const errorData = await response.json();
        Alert.alert("Error", errorData.message || "Failed to create note");
        return null;
      }
    } catch (error) {
      console.error("Error creating note:", error);
      Alert.alert("Error", "Network error while creating note");
      return null;
    }
  };

  const updateNoteInBackend = async (
    id: string,
    note: { title: string; content: string },
  ): Promise<boolean> => {
    try {
      const token = await getAuthToken();
      if (!token) {
        Alert.alert("Error", "Authentication required");
        return false;
      }

      const response = await apiCall(`${API_CONFIG.ENDPOINTS.NOTES}/${id}`, {
        method: "PUT",
        body: JSON.stringify({
          title: note.title,
          content: note.content,
        }),
      });

      if (response.ok) {
        return true;
      } else {
        const errorData = await response.json();
        Alert.alert("Error", errorData.message || "Failed to update note");
        return false;
      }
    } catch (error) {
      console.error("Error updating note:", error);
      Alert.alert("Error", "Network error while updating note");
      return false;
    }
  };

  const deleteNoteInBackend = async (id: string): Promise<boolean> => {
    try {
      const token = await getAuthToken();
      if (!token) {
        Alert.alert("Error", "Authentication required");
        return false;
      }

      const response = await apiCall(`${API_CONFIG.ENDPOINTS.NOTES}/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        return true;
      } else {
        const errorData = await response.json();
        Alert.alert("Error", errorData.message || "Failed to delete note");
        return false;
      }
    } catch (error) {
      console.error("Error deleting note:", error);
      Alert.alert("Error", "Network error while deleting note");
      return false;
    }
  };

  // Filter notes based on search query
  const filteredNotes = searchQuery
    ? notes.filter(
        (note) =>
          note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          note.content.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : notes;

  const animateButton = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.9,
        duration: 100,
        easing: Easing.ease,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        easing: Easing.ease,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const addNote = async () => {
    animateButton();
    if (!newTitle.trim() && !newContent.trim()) return;

    setLoading(true);
    try {
      const newNoteData = {
        title: newTitle.trim(),
        content: newContent.trim(),
      };

      const createdNote = await createNoteInBackend(newNoteData);

      if (createdNote) {
        setNotes([createdNote, ...notes]);
        setNewTitle("");
        setNewContent("");
      }
    } catch (error) {
      console.error("Error in addNote:", error);
    } finally {
      setLoading(false);
    }
  };

  const openNote = (note: Note) => {
    setExpandedNote(note);
    setIsEditing(false);
    setEditedTitle(note.title);
    setEditedContent(note.content);
  };

  const closeNote = () => {
    setExpandedNote(null);
    setIsEditing(false);
  };

  const startEditing = () => {
    if (expandedNote) setIsEditing(true);
  };

  const cancelEditing = () => {
    if (expandedNote) {
      setEditedTitle(expandedNote.title);
      setEditedContent(expandedNote.content);
    }
    setIsEditing(false);
  };

  const saveNote = async () => {
    if (!expandedNote) return;

    setLoading(true);
    try {
      const success = await updateNoteInBackend(expandedNote.id, {
        title: editedTitle,
        content: editedContent,
      });

      if (success) {
        setNotes((prev) =>
          prev.map((n) =>
            n.id === expandedNote.id
              ? { ...n, title: editedTitle, content: editedContent }
              : n,
          ),
        );
        setExpandedNote({
          ...expandedNote,
          title: editedTitle,
          content: editedContent,
        });
        setIsEditing(false);
      }
    } catch (error) {
      console.error("Error in saveNote:", error);
    } finally {
      setLoading(false);
    }
  };

  const deleteNote = async (id: string) => {
    setLoading(true);
    try {
      const success = await deleteNoteInBackend(id);
      if (success) {
        setNotes((prev) => prev.filter((n) => n.id !== id));
        closeNote();
      }
    } catch (error) {
      console.error("Error in deleteNote:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.header}>Notes</Text>
        <View style={styles.noteCount}>
          <Text style={styles.noteCountText}>
            {searchQuery
              ? `${filteredNotes.length}/${notes.length}`
              : notes.length}
          </Text>
        </View>
        <TouchableOpacity onPress={fetchNotes} style={styles.refreshButton}>
          <MaterialIcons name='refresh' size={16} color='#FFF8E1' />
        </TouchableOpacity>
      </View>

      <View style={styles.noteBox}>
        <View style={styles.inputsContainer}>
          <TextInput
            style={styles.input}
            placeholder='Title...'
            placeholderTextColor='#D7CCC8'
            value={newTitle}
            onChangeText={setNewTitle}
            editable={!loading}
          />

          <TextInput
            style={[styles.input, styles.contentInput]}
            placeholder='Content..'
            placeholderTextColor='#D7CCC8'
            value={newContent}
            onChangeText={setNewContent}
            multiline
            editable={!loading}
          />
        </View>

        {/* Modern FAB (Floating Action Button) */}
        <TouchableOpacity
          style={styles.fabContainer}
          onPress={addNote}
          activeOpacity={0.8}
          disabled={loading}
        >
          <Animated.View
            style={[styles.fab, { transform: [{ scale: scaleAnim }] }]}
          >
            {loading ? (
              <ActivityIndicator size='small' color='#FFFFFF' />
            ) : (
              <MaterialIcons name='add' size={24} color='#FFFFFF' />
            )}
          </Animated.View>
        </TouchableOpacity>

        <ScrollView
          style={styles.notesList}
          showsVerticalScrollIndicator={false}
        >
          {fetching ? (
            <View style={styles.loadingState}>
              <ActivityIndicator size='small' color='#D7CCC8' />
              <Text style={styles.loadingText}>Loading notes...</Text>
            </View>
          ) : filteredNotes.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>
                {searchQuery ? "No matching notes" : "No notes yet"}
              </Text>
              <Text style={styles.emptySubtext}>
                {searchQuery
                  ? "Try a different search"
                  : "Create your first note!"}
              </Text>
            </View>
          ) : (
            filteredNotes.map((note) => (
              <TouchableOpacity
                key={note.id}
                style={styles.noteCard}
                onPress={() => openNote(note)}
                activeOpacity={0.7}
                disabled={loading}
              >
                <View style={styles.noteHeader}>
                  <Text style={styles.noteTitle} numberOfLines={1}>
                    {note.title || "Untitled"}
                  </Text>
                  <View style={styles.noteIndicator} />
                </View>
                <Text style={styles.noteContent} numberOfLines={2}>
                  {note.content}
                </Text>
                {note.updatedAt && (
                  <Text style={styles.noteDate}>
                    {new Date(note.updatedAt).toLocaleDateString()}
                  </Text>
                )}
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      </View>

      {/* Enhanced Modal with Modern Cream Design */}
      <Modal
        visible={!!expandedNote}
        transparent
        animationType='slide'
        onRequestClose={closeNote}
      >
        <BlurView intensity={80} tint='dark' style={styles.modalOverlay}>
          <TouchableWithoutFeedback onPress={closeNote}>
            <View style={StyleSheet.absoluteFillObject} />
          </TouchableWithoutFeedback>

          {expandedNote && (
            <KeyboardAvoidingView
              behavior={Platform.OS === "ios" ? "padding" : "height"}
              style={styles.modalContainer}
            >
              <View style={styles.modalCard}>
                {/* Modal Header */}
                <View style={styles.modalHeader}>
                  <View style={styles.modalTitleContainer}>
                    {isEditing ? (
                      <TextInput
                        value={editedTitle}
                        onChangeText={setEditedTitle}
                        style={styles.modalTitleInput}
                        placeholder='Note title'
                        placeholderTextColor='#8D6E63'
                        autoFocus
                        editable={!loading}
                      />
                    ) : (
                      <Text style={styles.modalTitle} numberOfLines={1}>
                        {expandedNote.title || "Untitled"}
                      </Text>
                    )}
                  </View>

                  <View style={styles.headerActions}>
                    <TouchableOpacity
                      style={styles.iconButton}
                      onPress={closeNote}
                      disabled={loading}
                    >
                      <MaterialIcons name='close' size={22} color='#8D6E63' />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Modal Content */}
                <ScrollView
                  style={styles.modalContentScroll}
                  showsVerticalScrollIndicator={false}
                >
                  {isEditing ? (
                    <TextInput
                      value={editedContent}
                      onChangeText={setEditedContent}
                      style={styles.modalContentInput}
                      placeholder='Start typing...'
                      placeholderTextColor='#8D6E63'
                      multiline
                      textAlignVertical='top'
                      editable={!loading}
                    />
                  ) : (
                    <Text style={styles.modalContent}>
                      {expandedNote.content}
                    </Text>
                  )}
                </ScrollView>

                {/* Modal Actions */}
                <View style={styles.modalActions}>
                  {isEditing ? (
                    <View style={styles.actionRow}>
                      <TouchableOpacity
                        style={[styles.actionButton, styles.secondaryButton]}
                        onPress={cancelEditing}
                        disabled={loading}
                      >
                        <MaterialIcons name='close' size={18} color='#8D6E63' />
                        <Text style={styles.secondaryButtonText}>Cancel</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[
                          styles.actionButton,
                          styles.primaryButton,
                          loading && styles.disabledButton,
                        ]}
                        onPress={saveNote}
                        disabled={loading}
                      >
                        {loading ? (
                          <ActivityIndicator size='small' color='#FFFFFF' />
                        ) : (
                          <>
                            <MaterialIcons
                              name='check'
                              size={18}
                              color='#FFFFFF'
                            />
                            <Text style={styles.primaryButtonText}>Save</Text>
                          </>
                        )}
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <View style={styles.actionRow}>
                      <TouchableOpacity
                        style={[styles.actionButton, styles.editButton]}
                        onPress={startEditing}
                        disabled={loading}
                      >
                        <MaterialIcons name='edit' size={18} color='#FFFFFF' />
                        <Text style={styles.editButtonText}>Edit</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[
                          styles.actionButton,
                          styles.deleteButton,
                          loading && styles.disabledButton,
                        ]}
                        onPress={() => deleteNote(expandedNote.id)}
                        disabled={loading}
                      >
                        {loading ? (
                          <ActivityIndicator size='small' color='#FFFFFF' />
                        ) : (
                          <>
                            <MaterialIcons
                              name='delete-outline'
                              size={18}
                              color='#FFFFFF'
                            />
                            <Text style={styles.deleteButtonText}>Delete</Text>
                          </>
                        )}
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              </View>
            </KeyboardAvoidingView>
          )}
        </BlurView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#5D4037",
    borderRadius: 24,
    padding: 20,
    width: 180,
    minHeight: 200,
    shadowColor: "#3E2723",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  header: {
    fontSize: 18,
    fontWeight: "700",
    color: "#FFF8E1",
    letterSpacing: -0.5,
  },
  noteCount: {
    backgroundColor: "rgba(255, 248, 225, 0.2)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 248, 225, 0.3)",
  },
  noteCountText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#FFF8E1",
  },
  refreshButton: {
    padding: 4,
  },
  noteBox: {
    backgroundColor: "#4E342E",
    borderRadius: 20,
    padding: 16,
    flex: 1,
    borderWidth: 1,
    borderColor: "rgba(255, 248, 225, 0.1)",
  },
  inputsContainer: {
    marginBottom: 16,
  },
  input: {
    backgroundColor: "rgba(255, 248, 225, 0.1)",
    color: "#FFF8E1",
    padding: 12,
    borderRadius: 12,
    fontSize: 14,
    borderWidth: 1,
    borderColor: "rgba(255, 248, 225, 0.2)",
  },
  contentInput: {
    height: 60,
    marginTop: 8,
    textAlignVertical: "top",
  },
  fabContainer: {
    position: "absolute",
    bottom: 16,
    right: 16,
    zIndex: 10,
  },
  fab: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#D7A86E",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#3E2723",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  notesList: {
    marginTop: 8,
    maxHeight: 250,
  },
  loadingState: {
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  loadingText: {
    fontSize: 12,
    color: "#D7CCC8",
    marginTop: 8,
  },
  noteCard: {
    backgroundColor: "rgba(255, 248, 225, 0.15)",
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderLeftWidth: 3,
    borderLeftColor: "#D7A86E",
    borderWidth: 1,
    borderColor: "rgba(255, 248, 225, 0.1)",
  },
  noteHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  noteTitle: {
    fontWeight: "600",
    fontSize: 14,
    color: "#FFF8E1",
    flex: 1,
  },
  noteIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#D7A86E",
  },
  noteContent: {
    color: "#D7CCC8",
    fontSize: 12,
    lineHeight: 16,
  },
  noteDate: {
    color: "#8D6E63",
    fontSize: 10,
    marginTop: 4,
    fontStyle: "italic",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  emptyText: {
    fontSize: 12,
    color: "#D7CCC8",
    textAlign: "center",
    fontStyle: "italic",
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 10,
    color: "#8D6E63",
    textAlign: "center",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "90%",
    maxHeight: "85%",
  },
  modalCard: {
    backgroundColor: "#FFF8E1",
    borderRadius: 24,
    overflow: "hidden",
    shadowColor: "#3E2723",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 10,
    borderWidth: 1,
    borderColor: "rgba(141, 110, 99, 0.2)",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    padding: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#D7CCC8",
  },
  modalTitleContainer: {
    flex: 1,
    marginRight: 12,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#5D4037",
  },
  modalTitleInput: {
    fontSize: 20,
    fontWeight: "600",
    color: "#5D4037",
    borderBottomWidth: 2,
    borderBottomColor: "#D7A86E",
    paddingVertical: 4,
  },
  headerActions: {
    flexDirection: "row",
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#EFEBE9",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#D7CCC8",
  },
  modalContentScroll: {
    maxHeight: 400,
  },
  modalContent: {
    color: "#8D6E63",
    fontSize: 16,
    lineHeight: 24,
    padding: 20,
  },
  modalContentInput: {
    color: "#8D6E63",
    fontSize: 16,
    lineHeight: 24,
    padding: 20,
    minHeight: 200,
    textAlignVertical: "top",
    backgroundColor: "rgba(215, 204, 200, 0.1)",
    borderRadius: 8,
    margin: 8,
  },
  modalActions: {
    padding: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#D7CCC8",
  },
  actionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    minWidth: 100,
    justifyContent: "center",
  },
  primaryButton: {
    backgroundColor: "#8D6E63",
    shadowColor: "#5D4037",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    marginLeft: 6,
  },
  secondaryButton: {
    backgroundColor: "#EFEBE9",
    borderWidth: 1,
    borderColor: "#D7CCC8",
  },
  secondaryButtonText: {
    color: "#8D6E63",
    fontWeight: "600",
    marginLeft: 6,
  },
  editButton: {
    backgroundColor: "#A1887F",
  },
  editButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    marginLeft: 6,
  },
  deleteButton: {
    backgroundColor: "#BF6F5E",
  },
  deleteButtonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    marginLeft: 6,
  },
  disabledButton: {
    opacity: 0.6,
  },
});
