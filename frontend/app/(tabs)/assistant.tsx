import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import {
  ArrowLeft,
  Send,
  MoreVertical,
  History,
  Plus,
  Trash2,
} from "lucide-react-native";
import { useState, useEffect, useRef, useCallback } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Dimensions,
  TextInput,
  Alert,
  Keyboard,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { handleSessionExpired } from "../../utils/session";

// API Configuration - Define once, use everywhere
const API_CONFIG = {
  BASE_URL: "https://yova-virtual-assistant.onrender.com/api",
  ENDPOINTS: {
    CHATS: "/chats",
    CHAT_MESSAGES: "/chats/{id}/messages",
    ASSISTANT_CHAT: "/assistant/chat",
  },
};

// Constants
const { width, height } = Dimensions.get("window");
const WELCOME_MESSAGE =
  "Hey there! I'm YoVA, your AI assistant. I'm here to help you with anything you need. What's on your mind?";

// Types
interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface Chat {
  _id: string;
  id: string;
  title: string;
  messages: Message[];
  userId?: string;
  createdAt: string;
  updatedAt: string;
}

// Custom Hooks
const useKeyboard = () => {
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      "keyboardDidShow",
      (e) => {
        setKeyboardVisible(true);
        setKeyboardHeight(e.endCoordinates.height);
      },
    );

    const keyboardDidHideListener = Keyboard.addListener(
      "keyboardDidHide",
      () => {
        setKeyboardVisible(false);
        setKeyboardHeight(0);
      },
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  return { isKeyboardVisible, keyboardHeight };
};

const useTypingEffect = (text: string, isActive: boolean) => {
  const [displayedText, setDisplayedText] = useState("");

  useEffect(() => {
    if (!isActive || !text) {
      setDisplayedText(text);
      return;
    }

    let cancelled = false;
    let index = 0;
    let timeoutId: ReturnType<typeof setTimeout>;

    // Deriving the displayed slice from an absolute index (rather than
    // appending one character onto whatever the previous state happened to
    // be) means each tick is self-contained - nothing to desync if an
    // earlier tick got delayed or double-invoked (e.g. React StrictMode's
    // dev-mode double effect run), which was previously dropping the first
    // character of the reply.
    setDisplayedText(text.slice(0, 1));
    index = 1;

    const tick = () => {
      if (cancelled) return;
      if (index < text.length) {
        index++;
        setDisplayedText(text.slice(0, index));
        timeoutId = setTimeout(tick, 20);
      }
    };

    timeoutId = setTimeout(tick, 20);

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, [text, isActive]);

  return displayedText;
};

const useThinkingAnimation = (isThinking: boolean) => {
  const [thinkingDots, setThinkingDots] = useState("");

  useEffect(() => {
    if (!isThinking) {
      setThinkingDots("");
      return;
    }

    let dotCount = 0;
    const interval = setInterval(() => {
      dotCount = (dotCount + 1) % 4;
      setThinkingDots(".".repeat(dotCount));
    }, 500);

    return () => clearInterval(interval);
  }, [isThinking]);

  return thinkingDots;
};

// AI Service - talks to our own backend, which proxies to Groq. The API
// key never lives in this app; it stays server-side.
class HumanizedAIService {
  private baseUrl: string;
  private getAuthToken: () => Promise<string | null>;

  constructor(baseUrl: string, getAuthToken: () => Promise<string | null>) {
    this.baseUrl = baseUrl;
    this.getAuthToken = getAuthToken;
  }

  async generateHumanizedResponse(userInput: string): Promise<string> {
    try {
      const token = await this.getAuthToken();

      const response = await fetch(`${this.baseUrl}/assistant/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ message: userInput }),
      });

      if (response.status === 401) {
        await handleSessionExpired();
        return "Sorry, I'm having trouble thinking right now. Could you try again in a moment?";
      }

      if (!response.ok) {
        throw new Error(`Assistant request failed: ${response.status}`);
      }

      const data = await response.json();
      return this.postProcessResponse(data.reply || "", userInput);
    } catch (error) {
      console.error("AI Service Error:", error);
      return "Sorry, I'm having trouble thinking right now. Could you try again in a moment?";
    }
  }

  private postProcessResponse(text: string, userInput: string): string {
    let processed = text.trim();

    // Safety net: strip a stray literal "undefined" if it ever shows up.
    processed = processed.replace(/\s*undefined\s*$/i, "").trim();

    processed = processed.charAt(0).toUpperCase() + processed.slice(1);

    // Remove any markdown formatting or special characters that might cause issues
    processed = processed.replace(/\*\*(.*?)\*\*/g, "$1"); // Remove bold
    processed = processed.replace(/\*(.*?)\*/g, "$1"); // Remove italics

    return processed;
  }
}

// Components
const Header = ({
  onBack,
  onToggleHistory,
  onShowModelInfo,
  showHistory,
  onNewChat,
  currentChat,
}: any) => (
  <View style={styles.header}>
    <TouchableOpacity style={styles.headerButton} onPress={onBack}>
      <ArrowLeft size={24} color='#FFFFFF' strokeWidth={2} />
    </TouchableOpacity>
    <View style={styles.headerCenter}>
      <Text style={styles.headerTitle}>YoVA</Text>
      <Text style={styles.headerSubtitle} numberOfLines={1}>
        {currentChat?.title || "New Chat"}
      </Text>
    </View>
    <View style={styles.headerRight}>
      <TouchableOpacity style={styles.headerButton} onPress={onNewChat}>
        <Plus size={24} color='#FFFFFF' strokeWidth={2} />
      </TouchableOpacity>
      <TouchableOpacity style={styles.headerButton} onPress={onToggleHistory}>
        <History
          size={24}
          color={showHistory ? "#F5C563" : "#FFFFFF"}
          strokeWidth={2}
        />
      </TouchableOpacity>
      <TouchableOpacity style={styles.headerButton} onPress={onShowModelInfo}>
        <MoreVertical size={24} color='#FFFFFF' strokeWidth={2} />
      </TouchableOpacity>
    </View>
  </View>
);

const MessageBubble = ({
  message,
  isTyping,
  displayedText,
  thinkingDots,
}: any) => (
  <View
    style={[
      styles.messageContainer,
      message.role === "user" ? styles.userMessage : styles.assistantMessage,
    ]}
  >
    <View style={styles.messageHeader}>
      <Text style={styles.messageRole}>
        {message.role === "user" ? "You" : "YoVA"}
      </Text>
      <Text style={styles.messageTime}>
        {message.timestamp.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })}
      </Text>
    </View>
    {thinkingDots ? (
      <View style={styles.thinkingContainer}>
        <Text style={styles.thinkingText}>Thinking{thinkingDots}</Text>
      </View>
    ) : (
      <Text style={styles.messageText}>
        {isTyping ? displayedText : message.content}
        {isTyping && <Text style={styles.cursor}>|</Text>}
      </Text>
    )}
  </View>
);

const ChatHistorySidebar = ({
  chats,
  currentChat,
  onSelectChat,
  onDeleteChat,
  onClose,
  loading,
}: any) => (
  <View style={styles.historyContainer}>
    <View style={styles.historyHeader}>
      <Text style={styles.historyTitle}>Chat History</Text>
      <TouchableOpacity onPress={onClose} style={styles.hideButton}>
        <Text style={styles.hideButtonText}>✕</Text>
      </TouchableOpacity>
    </View>
    <ScrollView style={styles.historyList} showsVerticalScrollIndicator={false}>
      {loading ? (
        <View style={styles.loadingState}>
          <ActivityIndicator size='small' color='#F5C563' />
          <Text style={styles.loadingText}>Loading chats...</Text>
        </View>
      ) : chats.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No chats yet</Text>
          <Text style={styles.emptySubtext}>Start a new conversation!</Text>
        </View>
      ) : (
        chats.map((chat: Chat) => (
          <TouchableOpacity
            key={chat.id}
            style={[
              styles.historyItem,
              currentChat?.id === chat.id && styles.historyItemSelected,
            ]}
            onPress={() => onSelectChat(chat)}
          >
            <View style={styles.historyItemContent}>
              <Text style={styles.historyItemTitle} numberOfLines={1}>
                {chat.title}
              </Text>
              <Text style={styles.historyItemDate}>
                {new Date(chat.updatedAt).toLocaleDateString()}
              </Text>
            </View>
            <TouchableOpacity
              onPress={(e) => {
                e.stopPropagation(); // Prevent triggering onSelectChat
                onDeleteChat(chat.id);
              }}
              style={styles.deleteChatButton}
            >
              <Trash2 size={16} color='#8B7965' />
            </TouchableOpacity>
          </TouchableOpacity>
        ))
      )}
    </ScrollView>
  </View>
);

const InputBar = ({
  textInput,
  onTextChange,
  onSubmit,
  isProcessing,
  hasAvailableModels,
  isKeyboardVisible,
  keyboardHeight,
}: any) => {
  const handleSubmit = useCallback(() => {
    if (textInput.trim() && !isProcessing && hasAvailableModels) {
      onSubmit();
    }
  }, [textInput, isProcessing, hasAvailableModels, onSubmit]);

  const isSendDisabled =
    !textInput.trim() || isProcessing || !hasAvailableModels;

  return (
    <View
      style={[
        styles.inputBar,
        isKeyboardVisible && styles.inputBarKeyboardOpen,
        // Neither platform reliably auto-resizes around the keyboard here
        // (iOS never does; Android's edgeToEdgeEnabled setting means it
        // can't be relied on either), so push the bar up manually using
        // the tracked keyboard height.
        isKeyboardVisible && { marginBottom: keyboardHeight },
      ]}
    >
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          value={textInput}
          onChangeText={onTextChange}
          placeholder='Message YoVA...'
          placeholderTextColor='#8B7965'
          multiline
          editable={!isProcessing && hasAvailableModels}
          onSubmitEditing={handleSubmit}
          returnKeyType='send'
          blurOnSubmit={false}
        />
        <TouchableOpacity
          style={[
            styles.sendButton,
            isSendDisabled && styles.sendButtonDisabled,
          ]}
          onPress={handleSubmit}
          disabled={isSendDisabled}
        >
          {isProcessing ? (
            <ActivityIndicator size='small' color='#1A1410' />
          ) : (
            <Send size={20} color='#1A1410' strokeWidth={2.5} />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

// Main Chat Component
export default function AssistantScreen() {
  // State management
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChat, setCurrentChat] = useState<Chat | null>(null);
  const [textInput, setTextInput] = useState("");
  const [showHistory, setShowHistory] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [loadingChats, setLoadingChats] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Refs and hooks
  const scrollViewRef = useRef<ScrollView>(null);

  // Get auth token
  const getAuthToken = async (): Promise<string | null> => {
    try {
      return await AsyncStorage.getItem("userToken");
    } catch (error) {
      console.error("Error getting auth token:", error);
      return null;
    }
  };

  const aiService = useRef(
    new HumanizedAIService(API_CONFIG.BASE_URL, getAuthToken),
  );
  const { isKeyboardVisible, keyboardHeight } = useKeyboard();

  // Derived states
  const messages = currentChat?.messages || [];
  const lastMessage = messages[messages.length - 1];
  const isLastMessageFromAssistant = lastMessage?.role === "assistant";
  const displayedText = useTypingEffect(
    lastMessage?.content || "",
    !isProcessing && isLastMessageFromAssistant,
  );
  const thinkingDots = useThinkingAnimation(isProcessing);

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
      await handleSessionExpired();
    }

    if (!response.ok) {
      throw new Error(
        `API call failed: ${response.status} ${response.statusText}`,
      );
    }

    return response;
  };

  // Helper to format endpoint with parameters
  const formatEndpoint = (endpoint: string, params: Record<string, string>) => {
    let formattedEndpoint = endpoint;
    Object.keys(params).forEach((key) => {
      formattedEndpoint = formattedEndpoint.replace(`{${key}}`, params[key]);
    });
    return formattedEndpoint;
  };

  // Load chats from backend
  const loadChats = async () => {
    try {
      setLoadingChats(true);
      const token = await getAuthToken();

      if (!token) {
        console.log("No auth token found");
        return;
      }

      const response = await apiCall(API_CONFIG.ENDPOINTS.CHATS, {
        method: "GET",
      });

      const data = await response.json();
      const transformedChats = data.map((chat: any) => ({
        id: chat._id,
        _id: chat._id,
        title: chat.title,
        messages: chat.messages || [],
        userId: chat.userId,
        createdAt: chat.createdAt,
        updatedAt: chat.updatedAt,
      }));

      setChats(transformedChats);

      // If there are chats and no current chat is selected, select the most recent one
      if (transformedChats.length > 0 && !currentChat) {
        setCurrentChat(transformedChats[0]);
      }
    } catch (error) {
      console.error("Error fetching chats:", error);
      Alert.alert(
        "Error",
        "Failed to load chats. Please check your connection.",
      );
    } finally {
      setLoadingChats(false);
      setIsInitialized(true);
    }
  };

  // Create new chat in backend
  const createChatInBackend = async (title: string): Promise<Chat | null> => {
    try {
      const response = await apiCall(API_CONFIG.ENDPOINTS.CHATS, {
        method: "POST",
        body: JSON.stringify({
          title: title,
        }),
      });

      const data = await response.json();
      return {
        id: data._id,
        _id: data._id,
        title: data.title,
        messages: data.messages || [],
        userId: data.userId,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      };
    } catch (error) {
      console.error("Error creating chat:", error);
      Alert.alert("Error", "Failed to create chat. Please try again.");
      return null;
    }
  };

  // Add message to chat in backend
  const addMessageToChat = async (
    chatId: string,
    message: Message,
  ): Promise<boolean> => {
    try {
      const endpoint = formatEndpoint(API_CONFIG.ENDPOINTS.CHAT_MESSAGES, {
        id: chatId,
      });

      const response = await apiCall(endpoint, {
        method: "POST",
        body: JSON.stringify({
          chatId: chatId,
          message: {
            id: message.id,
            role: message.role,
            content: message.content,
            timestamp: message.timestamp.toISOString(),
          },
        }),
      });

      return true;
    } catch (error) {
      console.error("Error adding message:", error);
      return false;
    }
  };

  // Update chat title in backend
  const updateChatTitleInBackend = async (
    chatId: string,
    title: string,
  ): Promise<boolean> => {
    try {
      const endpoint = `${API_CONFIG.ENDPOINTS.CHATS}/${chatId}`;
      const response = await apiCall(endpoint, {
        method: "PUT",
        body: JSON.stringify({ title }),
      });

      return true;
    } catch (error) {
      console.error("Error updating chat title:", error);
      return false;
    }
  };

  // Delete chat from backend
  const deleteChatInBackend = async (chatId: string): Promise<boolean> => {
    try {
      const endpoint = `${API_CONFIG.ENDPOINTS.CHATS}/${chatId}`;
      const response = await apiCall(endpoint, {
        method: "DELETE",
      });

      return true;
    } catch (error) {
      console.error("Error deleting chat:", error);
      Alert.alert("Error", "Failed to delete chat. Please try again.");
      return false;
    }
  };

  // Initialize - load chats on component mount
  useEffect(() => {
    loadChats();
  }, []);

  // Scroll to bottom when new messages arrive or keyboard appears
  useEffect(() => {
    if (messages.length > 0 || isKeyboardVisible) {
      setTimeout(
        () => scrollViewRef.current?.scrollToEnd({ animated: true }),
        100,
      );
    }
  }, [messages.length, isKeyboardVisible]);

  // Create new chat
  const createNewChat = async () => {
    const newChatTitle = "New Chat";
    const newChat = await createChatInBackend(newChatTitle);
    if (newChat) {
      setCurrentChat(newChat);
      setChats((prev) => [newChat, ...prev]);
      setShowHistory(false);
    }
  };

  // Select existing chat
  const selectChat = async (chat: Chat) => {
    try {
      const endpoint = `${API_CONFIG.ENDPOINTS.CHATS}/${chat.id}`;
      const response = await apiCall(endpoint, {
        method: "GET",
      });

      const fullChat = await response.json();
      setCurrentChat({
        id: fullChat._id,
        _id: fullChat._id,
        title: fullChat.title,
        messages: fullChat.messages || [],
        userId: fullChat.userId,
        createdAt: fullChat.createdAt,
        updatedAt: fullChat.updatedAt,
      });
      setShowHistory(false);
    } catch (error) {
      console.error("Error loading chat:", error);
      Alert.alert("Error", "Failed to load chat. Please try again.");
    }
  };

  // Delete chat
  const deleteChat = async (chatId: string) => {
    Alert.alert("Delete Chat", "Are you sure you want to delete this chat?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          const success = await deleteChatInBackend(chatId);
          if (success) {
            setChats((prev) => prev.filter((chat) => chat.id !== chatId));
            if (currentChat?.id === chatId) {
              setCurrentChat(chats.find((chat) => chat.id !== chatId) || null);
            }
          }
        },
      },
    ]);
  };

  // Send message to AI and save to backend
  const sendToAI = async (userInput: string) => {
    let chatToUse = currentChat;

    // Create new chat if none exists
    if (!chatToUse) {
      const newChat = await createChatInBackend("New Chat");
      if (!newChat) {
        Alert.alert("Error", "Failed to create new chat");
        return;
      }
      chatToUse = newChat;
      setCurrentChat(newChat);
      setChats((prev) => [newChat, ...prev]);
    }

    try {
      setIsProcessing(true);

      // Create user message
      const userMessage: Message = {
        id: Date.now().toString(),
        role: "user",
        content: userInput,
        timestamp: new Date(),
      };

      // Add user message to current chat
      const updatedMessages = [...(chatToUse.messages || []), userMessage];
      const updatedChat = { ...chatToUse, messages: updatedMessages };
      setCurrentChat(updatedChat);

      // Save user message to backend
      await addMessageToChat(chatToUse.id, userMessage);

      // Generate AI response
      const responseText =
        await aiService.current.generateHumanizedResponse(userInput);

      // Create assistant message
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: responseText,
        timestamp: new Date(),
      };

      // Add assistant message to current chat
      const finalMessages = [...updatedMessages, assistantMessage];
      const finalChat = { ...updatedChat, messages: finalMessages };
      setCurrentChat(finalChat);

      // Save assistant message to backend
      await addMessageToChat(chatToUse.id, assistantMessage);

      // Update chat title with first user message if it's still "New Chat"
      if (
        chatToUse.title === "New Chat" &&
        finalMessages.filter((msg) => msg.role === "user").length === 1
      ) {
        const firstUserMessage = finalMessages.find(
          (msg) => msg.role === "user",
        );
        if (firstUserMessage) {
          const newTitle =
            firstUserMessage.content.length > 30
              ? firstUserMessage.content.substring(0, 30) + "..."
              : firstUserMessage.content;

          setCurrentChat((prev) =>
            prev ? { ...prev, title: newTitle } : null,
          );
          setChats((prev) =>
            prev.map((chat) =>
              chat.id === chatToUse.id ? { ...chat, title: newTitle } : chat,
            ),
          );

          // Update title in backend
          await updateChatTitleInBackend(chatToUse.id, newTitle);
        }
      }
    } catch (error) {
      console.error("Error in sendToAI:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content:
          "Hmm, I'm having a bit of trouble right now. Could you try again in a moment?",
        timestamp: new Date(),
      };
      setCurrentChat((prev) =>
        prev
          ? {
              ...prev,
              messages: [...(prev.messages || []), errorMessage],
            }
          : null,
      );
    } finally {
      setIsProcessing(false);
    }
  };

  // Event handlers
  const handleTextSubmit = useCallback(() => {
    if (textInput.trim() && !isProcessing) {
      sendToAI(textInput.trim());
      setTextInput("");
      Keyboard.dismiss();
    }
  }, [textInput, isProcessing]);

  const showModelInfo = useCallback(() => {
    Alert.alert("Connection Status", "✅ Connected to Gemini AI", [
      { text: "OK" },
    ]);
  }, []);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#4A3F35", "#3D3329", "#2D2520"]}
        style={styles.gradient}
      >
        <Header
          onBack={() => router.back()}
          onToggleHistory={() => setShowHistory((prev) => !prev)}
          onShowModelInfo={showModelInfo}
          onNewChat={createNewChat}
          showHistory={showHistory}
          currentChat={currentChat}
        />

        <View style={styles.content}>
          {/* Main Chat Area */}
          <View
            style={[
              styles.chatContainer,
              !showHistory && styles.chatContainerFull,
            ]}
          >
            <ScrollView
              ref={scrollViewRef}
              contentContainerStyle={[
                styles.chatContent,
                {
                  paddingBottom: isKeyboardVisible ? keyboardHeight + 120 : 120,
                },
              ]}
              showsVerticalScrollIndicator={false}
            >
              {!currentChat && isInitialized && (
                <View style={styles.welcomeContainer}>
                  <Text style={styles.welcomeTitle}>Hello! I'm YoVA 👋</Text>
                  <Text style={styles.welcomeSubtitle}>
                    Your friendly AI assistant here to help with anything you
                    need. What would you like to know?
                  </Text>
                </View>
              )}

              {messages.map((message, index) => {
                const isLastMessage = index === messages.length - 1;
                const isAssistant = message.role === "assistant";
                const isTyping = isLastMessage && isAssistant && !isProcessing;

                return (
                  <MessageBubble
                    key={message.id}
                    message={message}
                    isTyping={isTyping}
                    displayedText={displayedText}
                  />
                );
              })}

              {isProcessing && (
                <MessageBubble
                  message={{
                    id: "thinking",
                    role: "assistant",
                    content: "",
                    timestamp: new Date(),
                  }}
                  thinkingDots={thinkingDots}
                />
              )}
            </ScrollView>
          </View>

          {/* Chat History Sidebar */}
          {showHistory && (
            <ChatHistorySidebar
              chats={chats}
              currentChat={currentChat}
              onSelectChat={selectChat}
              onDeleteChat={deleteChat}
              onClose={() => setShowHistory(false)}
              loading={loadingChats}
            />
          )}
        </View>

        {/* Input Bar */}
        <InputBar
          textInput={textInput}
          onTextChange={setTextInput}
          onSubmit={handleTextSubmit}
          isProcessing={isProcessing}
          hasAvailableModels={true}
          isKeyboardVisible={isKeyboardVisible}
          keyboardHeight={keyboardHeight}
        />
      </LinearGradient>
    </View>
  );
}

// Styles (unchanged, but here for completeness)
const styles = StyleSheet.create({
  container: { flex: 1 },
  gradient: { flex: 1 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(139, 121, 101, 0.3)",
  },
  headerButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  headerRight: { flexDirection: "row", gap: 8 },
  headerCenter: { alignItems: "center", flex: 1, marginHorizontal: 10 },
  headerTitle: { fontSize: 20, fontWeight: "700", color: "#F5C563" },
  headerSubtitle: {
    fontSize: 12,
    color: "#E8DDD3",
    opacity: 0.8,
    marginTop: 2,
  },
  content: {
    flex: 1,
    flexDirection: "row",
  },
  chatContainer: {
    flex: 1,
    marginRight: 12,
  },
  chatContainerFull: {
    marginRight: 0,
  },
  chatContent: {
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  welcomeContainer: {
    alignItems: "center",
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#F5C563",
    marginBottom: 8,
    textAlign: "center",
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: "#E8DDD3",
    opacity: 0.8,
    textAlign: "center",
    lineHeight: 22,
  },
  messageContainer: {
    marginBottom: 20,
    padding: 16,
    borderRadius: 12,
  },
  userMessage: {
    backgroundColor: "rgba(139, 121, 101, 0.2)",
    marginLeft: 40,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    borderBottomLeftRadius: 12,
  },
  assistantMessage: {
    backgroundColor: "rgba(45, 37, 32, 0.8)",
    marginRight: 40,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(139, 121, 101, 0.3)",
  },
  messageHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  messageRole: {
    fontSize: 14,
    fontWeight: "600",
    color: "#F5C563",
    flex: 1,
  },
  messageTime: {
    fontSize: 12,
    color: "#8B7965",
  },
  messageText: {
    fontSize: 16,
    color: "#FFFFFF",
    lineHeight: 22,
  },
  thinkingContainer: {
    paddingVertical: 8,
  },
  thinkingText: {
    fontSize: 16,
    color: "#F5C563",
    fontStyle: "italic",
  },
  cursor: {
    color: "#F5C563",
    fontWeight: "bold",
  },
  inputBar: {
    backgroundColor: "rgba(26, 20, 16, 0.95)",
    borderTopWidth: 1,
    borderTopColor: "rgba(139, 121, 101, 0.3)",
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingBottom: 20,
  },
  inputBarKeyboardOpen: {
    paddingBottom: 10,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  textInput: {
    flex: 1,
    backgroundColor: "rgba(139, 121, 101, 0.3)",
    borderColor: "rgba(232, 221, 211, 0.2)",
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: "#FFFFFF",
    fontSize: 16,
    marginRight: 8,
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: "#F5C563",
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  sendButtonDisabled: {
    backgroundColor: "#8B7965",
    opacity: 0.5,
  },
  historyContainer: {
    width: width * 0.35,
    backgroundColor: "rgba(45, 37, 32, 0.9)",
    borderLeftWidth: 1,
    borderLeftColor: "rgba(139, 121, 101, 0.3)",
  },
  historyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(139, 121, 101, 0.3)",
  },
  historyTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#F5C563",
  },
  hideButton: {
    padding: 4,
  },
  hideButtonText: {
    color: "#F5C563",
    fontSize: 16,
    fontWeight: "bold",
  },
  historyList: {
    flex: 1,
    padding: 8,
  },
  historyItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "transparent",
    backgroundColor: "rgba(139, 121, 101, 0.2)",
  },
  historyItemSelected: {
    borderColor: "#F5C563",
    backgroundColor: "rgba(245, 197, 99, 0.1)",
  },
  historyItemContent: {
    flex: 1,
  },
  historyItemTitle: {
    fontSize: 14,
    color: "#E8DDD3",
    fontWeight: "500",
    marginBottom: 4,
  },
  historyItemDate: {
    fontSize: 11,
    color: "#8B7965",
  },
  deleteChatButton: {
    padding: 4,
    marginLeft: 8,
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
