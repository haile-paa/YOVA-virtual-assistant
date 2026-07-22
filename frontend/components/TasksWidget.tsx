import { MaterialIcons } from "@expo/vector-icons";
import { SquareCheck as CheckSquare, Square } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { handleSessionExpired } from "../utils/session";

// API Configuration - Define once, use everywhere
const API_CONFIG = {
  BASE_URL: "https://yova-virtual-assistant.onrender.com/api",
  ENDPOINTS: {
    TASKS: "/tasks",
    CLEAR_COMPLETED: "/tasks/clear-completed",
  },
};

interface Task {
  _id?: string;
  id: string;
  title: string;
  is_completed: boolean;
  userId?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface TasksWidgetProps {
  initialTasks?: Task[];
  searchQuery?: string;
}

export default function TasksWidget({
  initialTasks = [],
  searchQuery = "",
}: TasksWidgetProps) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [showInput, setShowInput] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  // Fetch tasks from backend on component mount
  useEffect(() => {
    fetchTasks();
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

  const fetchTasks = async () => {
    try {
      setFetching(true);
      const token = await getAuthToken();

      if (!token) {
        console.log("No auth token found");
        setFetching(false);
        return;
      }

      const response = await apiCall(API_CONFIG.ENDPOINTS.TASKS, {
        method: "GET",
      });

      if (response.ok) {
        const data = await response.json();
        // Transform backend data to match frontend interface
        const transformedTasks = data.map((task: any) => ({
          id: task._id || task.id,
          _id: task._id,
          title: task.title,
          is_completed: task.is_completed,
          userId: task.userId,
          createdAt: task.createdAt,
          updatedAt: task.updatedAt,
        }));
        setTasks(transformedTasks);
      } else {
        console.error("Failed to fetch tasks:", response.status);
      }
    } catch (error) {
      console.error("Error fetching tasks:", error);
      Alert.alert("Error", "Failed to load tasks");
    } finally {
      setFetching(false);
    }
  };

  const createTaskInBackend = async (task: {
    title: string;
  }): Promise<Task | null> => {
    try {
      const token = await getAuthToken();
      if (!token) {
        Alert.alert("Error", "Authentication required");
        return null;
      }

      const response = await apiCall(API_CONFIG.ENDPOINTS.TASKS, {
        method: "POST",
        body: JSON.stringify({
          title: task.title,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        return {
          id: data._id || data.id,
          _id: data._id,
          title: data.title,
          is_completed: data.is_completed,
          userId: data.userId,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
        };
      } else {
        const errorData = await response.json();
        Alert.alert("Error", errorData.message || "Failed to create task");
        return null;
      }
    } catch (error) {
      console.error("Error creating task:", error);
      Alert.alert("Error", "Network error while creating task");
      return null;
    }
  };

  const updateTaskInBackend = async (
    id: string,
    task: { title: string; is_completed: boolean },
  ): Promise<boolean> => {
    try {
      const token = await getAuthToken();
      if (!token) {
        Alert.alert("Error", "Authentication required");
        return false;
      }

      const response = await apiCall(`${API_CONFIG.ENDPOINTS.TASKS}/${id}`, {
        method: "PUT",
        body: JSON.stringify({
          title: task.title,
          is_completed: task.is_completed,
        }),
      });

      if (response.ok) {
        return true;
      } else {
        const errorData = await response.json();
        Alert.alert("Error", errorData.message || "Failed to update task");
        return false;
      }
    } catch (error) {
      console.error("Error updating task:", error);
      Alert.alert("Error", "Network error while updating task");
      return false;
    }
  };

  const deleteTaskInBackend = async (id: string): Promise<boolean> => {
    try {
      const token = await getAuthToken();
      if (!token) {
        Alert.alert("Error", "Authentication required");
        return false;
      }

      const response = await apiCall(`${API_CONFIG.ENDPOINTS.TASKS}/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        return true;
      } else {
        const errorData = await response.json();
        Alert.alert("Error", errorData.message || "Failed to delete task");
        return false;
      }
    } catch (error) {
      console.error("Error deleting task:", error);
      Alert.alert("Error", "Network error while deleting task");
      return false;
    }
  };

  const clearCompletedInBackend = async (): Promise<boolean> => {
    try {
      const token = await getAuthToken();
      if (!token) {
        Alert.alert("Error", "Authentication required");
        return false;
      }

      const response = await apiCall(API_CONFIG.ENDPOINTS.CLEAR_COMPLETED, {
        method: "DELETE",
      });

      if (response.ok) {
        return true;
      } else {
        const errorData = await response.json();
        Alert.alert(
          "Error",
          errorData.message || "Failed to clear completed tasks",
        );
        return false;
      }
    } catch (error) {
      console.error("Error clearing completed tasks:", error);
      Alert.alert("Error", "Network error while clearing completed tasks");
      return false;
    }
  };

  // Filter tasks based on search query
  const filteredTasks = searchQuery
    ? tasks.filter((task) =>
        task.title.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : tasks;

  // Keyboard listeners
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow",
      () => setKeyboardVisible(true),
    );
    const keyboardDidHideListener = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide",
      () => setKeyboardVisible(false),
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  const taskExamples = [
    "Call Alex",
    "Finish report",
    "Buy groceries",
    "Schedule meeting",
    "Reply to emails",
    "Book flights",
    "Prepare presentation",
    "Clean desk",
    "Pay bills",
    "Update portfolio",
    "Research topic",
    "Write blog post",
    "Plan weekend",
    "Review documents",
    "Send invoices",
  ];

  const getRandomExample = () => {
    const randomIndex = Math.floor(Math.random() * taskExamples.length);
    return taskExamples[randomIndex];
  };

  const addTask = async () => {
    if (!newTaskTitle.trim()) {
      Alert.alert("Missing info", "Please enter a task title.");
      return;
    }

    setLoading(true);
    try {
      const taskData = {
        title: newTaskTitle.trim(),
      };

      const createdTask = await createTaskInBackend(taskData);

      if (createdTask) {
        setTasks([createdTask, ...tasks]);
        setNewTaskTitle("");
        setShowInput(false);
        Keyboard.dismiss();
      }
    } catch (error) {
      console.error("Error in addTask:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleTask = async (id: string) => {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;

    setLoading(true);
    try {
      const success = await updateTaskInBackend(id, {
        title: task.title,
        is_completed: !task.is_completed,
      });

      if (success) {
        setTasks(
          tasks.map((task) =>
            task.id === id
              ? { ...task, is_completed: !task.is_completed }
              : task,
          ),
        );
      }
    } catch (error) {
      console.error("Error in toggleTask:", error);
    } finally {
      setLoading(false);
    }
  };

  const deleteTask = async (id: string) => {
    setLoading(true);
    try {
      const success = await deleteTaskInBackend(id);
      if (success) {
        setTasks(tasks.filter((task) => task.id !== id));
      }
    } catch (error) {
      console.error("Error in deleteTask:", error);
    } finally {
      setLoading(false);
    }
  };

  const clearCompleted = async () => {
    setLoading(true);
    try {
      const success = await clearCompletedInBackend();
      if (success) {
        setTasks(tasks.filter((task) => !task.is_completed));
      }
    } catch (error) {
      console.error("Error in clearCompleted:", error);
    } finally {
      setLoading(false);
    }
  };

  const addExampleTask = async () => {
    setLoading(true);
    try {
      const taskData = {
        title: getRandomExample(),
      };

      const createdTask = await createTaskInBackend(taskData);

      if (createdTask) {
        setTasks([createdTask, ...tasks]);
      }
    } catch (error) {
      console.error("Error in addExampleTask:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleShowInput = () => {
    setShowInput(true);
  };

  const handleCloseInput = () => {
    setShowInput(false);
    setNewTaskTitle("");
    Keyboard.dismiss();
  };

  const completedCount = filteredTasks.filter(
    (task) => task.is_completed,
  ).length;
  const totalCount = filteredTasks.length;

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
      >
        <View
          style={[
            styles.widgetContainer,
            keyboardVisible && styles.widgetContainerWithKeyboard,
          ]}
        >
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Tasks</Text>
              {totalCount > 0 && (
                <Text style={styles.subtitle}>
                  {completedCount} of {totalCount} completed
                  {searchQuery && ` • Searching: "${searchQuery}"`}
                </Text>
              )}
            </View>
            <View style={styles.headerActions}>
              {totalCount > 0 && completedCount > 0 && (
                <TouchableOpacity
                  onPress={clearCompleted}
                  style={styles.clearButton}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator size='small' color='#8B7965' />
                  ) : (
                    <MaterialIcons name='clear-all' size={18} color='#8B7965' />
                  )}
                </TouchableOpacity>
              )}
              <TouchableOpacity
                onPress={addExampleTask}
                style={styles.exampleButton}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator size='small' color='#1A1410' />
                ) : (
                  <MaterialIcons name='lightbulb' size={20} color='#1A1410' />
                )}
              </TouchableOpacity>
              <TouchableOpacity
                onPress={showInput ? handleCloseInput : handleShowInput}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator size='small' color='#1A1410' />
                ) : (
                  <MaterialIcons
                    name={showInput ? "close" : "add"}
                    size={24}
                    color='#1A1410'
                  />
                )}
              </TouchableOpacity>
            </View>
          </View>

          {showInput && (
            <View style={styles.inputContainer}>
              <TextInput
                placeholder={`e.g., ${getRandomExample()}`}
                value={newTaskTitle}
                onChangeText={setNewTaskTitle}
                style={styles.input}
                placeholderTextColor='#8B7965'
                onSubmitEditing={addTask}
                autoFocus={true}
                returnKeyType='done'
                editable={!loading}
              />
              <TouchableOpacity
                style={[styles.addButton, loading && styles.disabledButton]}
                onPress={addTask}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator size='small' color='#F5C563' />
                ) : (
                  <Text style={styles.addButtonText}>Add</Text>
                )}
              </TouchableOpacity>
            </View>
          )}

          {/* Main content area */}
          <View style={styles.contentArea}>
            {fetching ? (
              <View style={styles.loadingState}>
                <ActivityIndicator size='small' color='#8B7965' />
                <Text style={styles.loadingText}>Loading tasks...</Text>
              </View>
            ) : filteredTasks.length === 0 && !showInput ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>
                  {searchQuery ? "No matching tasks" : "No tasks yet"}
                </Text>
                <Text style={styles.addNewText}>
                  {searchQuery ? (
                    "Try a different search term"
                  ) : (
                    <>
                      Tap{" "}
                      <MaterialIcons
                        name='lightbulb'
                        size={14}
                        color='#1A1410'
                      />{" "}
                      for examples or <Text style={styles.plusText}>+</Text> to
                      add tasks
                    </>
                  )}
                </Text>
              </View>
            ) : (
              <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={true}
                keyboardShouldPersistTaps='handled'
              >
                {filteredTasks.map((task) => (
                  <View key={task.id} style={styles.taskRow}>
                    <TouchableOpacity
                      style={styles.checkboxContainer}
                      onPress={() => toggleTask(task.id)}
                      disabled={loading}
                    >
                      {loading ? (
                        <ActivityIndicator size='small' color='#1A1410' />
                      ) : task.is_completed ? (
                        <CheckSquare
                          size={20}
                          color='#1A1410'
                          strokeWidth={2}
                        />
                      ) : (
                        <Square size={20} color='#1A1410' strokeWidth={2} />
                      )}
                    </TouchableOpacity>
                    <Text
                      style={[
                        styles.taskTitle,
                        task.is_completed && styles.taskTitleCompleted,
                      ]}
                      numberOfLines={2}
                    >
                      {task.title}
                    </Text>
                    <TouchableOpacity
                      onPress={() => deleteTask(task.id)}
                      style={styles.deleteButton}
                      disabled={loading}
                    >
                      {loading ? (
                        <ActivityIndicator size='small' color='#8B7965' />
                      ) : (
                        <MaterialIcons
                          name='delete'
                          size={16}
                          color='#8B7965'
                        />
                      )}
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>
            )}
          </View>
        </View>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#E8DDD3",
    borderRadius: 24,
    width: 200,
    height: 350, // Fixed height
  },
  widgetContainer: {
    padding: 20,
    flex: 1,
  },
  widgetContainerWithKeyboard: {
    paddingBottom: 10,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
    minHeight: 40, // Ensure consistent header height
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1A1410",
  },
  subtitle: {
    fontSize: 12,
    color: "#8B7965",
    marginTop: 2,
  },
  inputContainer: {
    flexDirection: "row",
    marginBottom: 16,
    gap: 1,
    minHeight: 40, // Ensure consistent input height
  },
  input: {
    backgroundColor: "#D4C4B8",
    borderRadius: 8,
    padding: 10,
    flex: 1,
    color: "#1A1410",
    fontSize: 14,
    minHeight: 40,
  },
  addButton: {
    backgroundColor: "#1A1410",
    borderRadius: 8,
    padding: 10,
    justifyContent: "center",
    minHeight: 40,
  },
  disabledButton: {
    opacity: 0.6,
  },
  addButtonText: {
    color: "#F5C563",
    fontWeight: "600",
    fontSize: 14,
  },
  // Main content area that takes remaining space
  contentArea: {
    flex: 1,
    minHeight: 150,
  },
  // ScrollView styles
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 8, // Add some padding at bottom for better scrolling
  },
  taskRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 8,
    minHeight: 24, // Consistent task row height
  },
  checkboxContainer: {
    padding: 2,
  },
  taskTitle: {
    fontSize: 15,
    color: "#1A1410",
    fontWeight: "500",
    flex: 1,
  },
  taskTitleCompleted: {
    textDecorationLine: "line-through",
    color: "#8B7965",
  },
  deleteButton: {
    padding: 4,
  },
  clearButton: {
    padding: 4,
  },
  exampleButton: {
    padding: 4,
  },
  loadingState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  loadingText: {
    fontSize: 12,
    color: "#8B7965",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  emptyText: {
    fontSize: 14,
    color: "#8B7965",
    textAlign: "center",
    fontStyle: "italic",
  },
  addNewText: {
    fontSize: 12,
    color: "#8B7965",
    textAlign: "center",
    lineHeight: 16,
  },
  plusText: {
    fontWeight: "700",
    color: "#1A1410",
  },
});
