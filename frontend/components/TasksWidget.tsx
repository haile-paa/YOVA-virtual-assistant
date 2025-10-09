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
} from "react-native";
import uuid from "react-native-uuid";

interface Task {
  id: string;
  title: string;
  is_completed: boolean;
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

  // Filter tasks based on search query
  const filteredTasks = searchQuery
    ? tasks.filter((task) =>
        task.title.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : tasks;

  // Keyboard listeners
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow",
      () => setKeyboardVisible(true)
    );
    const keyboardDidHideListener = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide",
      () => setKeyboardVisible(false)
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

  const addTask = () => {
    if (!newTaskTitle.trim()) {
      Alert.alert("Missing info", "Please enter a task title.");
      return;
    }

    const newTask: Task = {
      id: uuid.v4().toString(),
      title: newTaskTitle.trim(),
      is_completed: false,
    };

    setTasks([newTask, ...tasks]);
    setNewTaskTitle("");
    setShowInput(false);
    Keyboard.dismiss();
  };

  const toggleTask = (id: string) => {
    setTasks(
      tasks.map((task) =>
        task.id === id ? { ...task, is_completed: !task.is_completed } : task
      )
    );
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter((task) => task.id !== id));
  };

  const clearCompleted = () => {
    setTasks(tasks.filter((task) => !task.is_completed));
  };

  const addExampleTask = () => {
    const exampleTask: Task = {
      id: uuid.v4().toString(),
      title: getRandomExample(),
      is_completed: false,
    };
    setTasks([exampleTask, ...tasks]);
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
    (task) => task.is_completed
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
                >
                  <MaterialIcons name='clear-all' size={18} color='#8B7965' />
                </TouchableOpacity>
              )}
              <TouchableOpacity
                onPress={addExampleTask}
                style={styles.exampleButton}
              >
                <MaterialIcons name='lightbulb' size={20} color='#1A1410' />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={showInput ? handleCloseInput : handleShowInput}
              >
                <MaterialIcons
                  name={showInput ? "close" : "add"}
                  size={24}
                  color='#1A1410'
                />
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
              />
              <TouchableOpacity style={styles.addButton} onPress={addTask}>
                <Text style={styles.addButtonText}>Add</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Main content area */}
          <View style={styles.contentArea}>
            {filteredTasks.length === 0 && !showInput ? (
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
                    >
                      {task.is_completed ? (
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
                    >
                      <MaterialIcons name='delete' size={16} color='#8B7965' />
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
