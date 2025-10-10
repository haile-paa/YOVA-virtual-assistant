import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { ArrowLeft, Send, MoreVertical, History } from "lucide-react-native";
import { useState, useEffect, useRef, useCallback, useMemo } from "react";
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
  NativeSyntheticEvent,
  TextInputSubmitEditingEventData,
} from "react-native";
import { GoogleGenAI } from "@google/genai";
import { GENAI_API_KEY } from "@env";

// Constants
const { width, height } = Dimensions.get("window");
const WELCOME_MESSAGE =
  "Hey there! I'm YoVA, your AI assistant. I'm here to help you with anything you need. What's on your mind?";
const AI_MODELS = [
  "gemini-2.0-flash-exp",
  "gemini-1.5-flash",
  "gemini-1.5-pro",
];

// Types
interface Message {
  id: string;
  role: "user" | "assistant";
  text: string;
  timestamp: Date;
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
      }
    );

    const keyboardDidHideListener = Keyboard.addListener(
      "keyboardDidHide",
      () => {
        setKeyboardVisible(false);
        setKeyboardHeight(0);
      }
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
  const typingIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isActive || !text) {
      setDisplayedText(text);
      return;
    }

    let currentIndex = 0;
    setDisplayedText("");

    typingIntervalRef.current = setInterval(() => {
      if (currentIndex < text.length) {
        setDisplayedText((prev) => prev + text[currentIndex]);
        currentIndex++;
      } else {
        typingIntervalRef.current && clearInterval(typingIntervalRef.current);
      }
    }, 20) as unknown as number;

    return () => {
      typingIntervalRef.current && clearInterval(typingIntervalRef.current);
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

// AI Service with optimized human-like responses
class HumanizedAIService {
  private genAI: GoogleGenAI;

  constructor(apiKey: string) {
    this.genAI = new GoogleGenAI({ apiKey });
  }

  async testModels(models: string[]): Promise<string[]> {
    const workingModels: string[] = [];
    for (const modelName of models) {
      try {
        const response = await this.genAI.models.generateContent({
          model: modelName,
          contents: "Say 'Hello' in a friendly, human way",
        });
        if (response.text) workingModels.push(modelName);
      } catch (error) {
        console.log(`❌ Model ${modelName} failed:`, error);
      }
    }
    return workingModels;
  }

  async generateHumanizedResponse(
    model: string,
    userInput: string
  ): Promise<string> {
    try {
      const humanizedPrompt = this.createHumanizedPrompt(userInput);
      const response = await this.genAI.models.generateContent({
        model,
        contents: humanizedPrompt,
      });

      let responseText =
        response.text ||
        "Hmm, I'm not sure how to respond to that. Could you try asking in a different way?";
      return this.postProcessResponse(responseText, userInput);
    } catch (error) {
      console.error("AI Service Error:", error);
      return "Sorry, I'm having trouble thinking right now. Could you try again in a moment?";
    }
  }

  private createHumanizedPrompt(userInput: string): string {
    const basePrompt = `Respond naturally and conversationally. Be friendly, concise, and avoid robotic language. Use contractions and show personality. User's message: "${userInput}"`;

    if (this.isQuestion(userInput))
      return (
        basePrompt +
        "\n\nAnswer directly and helpfully without unnecessary preamble."
      );
    if (this.isCasualGreeting(userInput))
      return (
        basePrompt +
        "\n\nRespond warmly and briefly, then ask how you can help."
      );

    return basePrompt;
  }

  private isQuestion(input: string): boolean {
    const questionWords = [
      "what",
      "how",
      "why",
      "when",
      "where",
      "who",
      "which",
      "can",
      "could",
      "would",
      "should",
      "is",
      "are",
      "do",
      "does",
    ];
    const lowerInput = input.toLowerCase().trim();
    return (
      questionWords.some((word) => lowerInput.startsWith(word)) ||
      lowerInput.includes("?")
    );
  }

  private isCasualGreeting(input: string): boolean {
    const greetings = [
      "hello",
      "hi",
      "hey",
      "hi there",
      "hello there",
      "hey there",
    ];
    const lowerInput = input.toLowerCase().trim();
    return greetings.some(
      (greeting) =>
        lowerInput === greeting || lowerInput.startsWith(greeting + " ")
    );
  }

  private postProcessResponse(text: string, userInput: string): string {
    let processed = text
      .replace(
        /^(As an AI assistant,?|I am an AI|As a language model,?)\s*/i,
        ""
      )
      .replace(/I am designed to/gi, "I can")
      .replace(/utilize/gi, "use")
      .replace(/assistance/gi, "help")
      .trim();

    if (
      this.isCasualGreeting(userInput) &&
      !/^[Hh]i|[Hh]ey|[Hh]ello/.test(processed)
    ) {
      const naturalStarters = [
        "Hey!",
        "Hi!",
        "Hello!",
        "Hey there!",
        "Hi there!",
      ];
      processed = `${
        naturalStarters[Math.floor(Math.random() * naturalStarters.length)]
      } ${processed}`;
    }

    processed = processed.charAt(0).toUpperCase() + processed.slice(1);
    if (processed.length < 10 && !processed.includes("?"))
      processed += " How can I help you further?";

    return processed;
  }
}

// Quick response templates for common queries
const quickResponses: { [key: string]: string } = {
  hello: "Hey there! 👋 How can I help you today?",
  hi: "Hello! 😊 What's on your mind?",
  hey: "Hey! 👋 What can I do for you?",
  "how are you":
    "I'm doing great, thanks for asking! Ready to help you with whatever you need.",
  "thank you": "You're welcome! 😊 Happy to help!",
  thanks: "No problem! Let me know if you need anything else.",
  "what can you do":
    "I can help with answering questions, brainstorming ideas, explaining concepts, and much more! What would you like to know?",
  "who are you":
    "I'm YoVA! Your friendly AI assistant developed by Pa Dev's. here to help you with anything you need. 😊",
};

// Components
const Header = ({
  onBack,
  onToggleHistory,
  onShowModelInfo,
  showHistory,
}: any) => (
  <View style={styles.header}>
    <TouchableOpacity style={styles.headerButton} onPress={onBack}>
      <ArrowLeft size={24} color='#FFFFFF' strokeWidth={2} />
    </TouchableOpacity>
    <View style={styles.headerCenter}>
      <Text style={styles.headerTitle}>YoVA</Text>
      <Text style={styles.headerSubtitle}>AI Assistant</Text>
    </View>
    <View style={styles.headerRight}>
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
        {isTyping ? displayedText : message.text}
        {isTyping && <Text style={styles.cursor}>|</Text>}
      </Text>
    )}
  </View>
);

const HistorySidebar = ({
  conversation,
  selectedMessage,
  onSelectMessage,
  onClose,
}: any) => (
  <View style={styles.historyContainer}>
    <View style={styles.historyHeader}>
      <Text style={styles.historyTitle}>Conversation History</Text>
      <TouchableOpacity onPress={onClose} style={styles.hideButton}>
        <Text style={styles.hideButtonText}>✕</Text>
      </TouchableOpacity>
    </View>
    <ScrollView style={styles.historyList} showsVerticalScrollIndicator={false}>
      {conversation.map((message: Message) => (
        <TouchableOpacity
          key={message.id}
          style={[
            styles.historyItem,
            selectedMessage === message.id && styles.historyItemSelected,
          ]}
          onPress={() => onSelectMessage(message.id)}
        >
          <Text style={styles.historyIcon}>
            {message.role === "user" ? "👤" : "🤖"}
          </Text>
          <Text style={styles.historyText} numberOfLines={2}>
            {message.text}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  </View>
);

const InputBar = ({
  textInput,
  onTextChange,
  onSubmit,
  isProcessing,
  hasAvailableModels,
  onClear,
  hasConversation,
}: any) => {
  const handleSubmit = useCallback(() => onSubmit(), [onSubmit]);
  const isSendDisabled =
    !textInput.trim() || isProcessing || !hasAvailableModels;

  return (
    <View style={styles.inputBar}>
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
        />
        <TouchableOpacity
          style={[
            styles.sendButton,
            isSendDisabled && styles.sendButtonDisabled,
          ]}
          onPress={onSubmit}
          disabled={isSendDisabled}
        >
          <Send size={20} color='#1A1410' strokeWidth={2.5} />
        </TouchableOpacity>
      </View>
      {hasConversation && (
        <TouchableOpacity style={styles.clearButton} onPress={onClear}>
          <Text style={styles.clearButtonText}>Clear Chat</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

// Main Chat Component
export default function AssistantScreen() {
  // State management
  const [conversation, setConversation] = useState<Message[]>([]);
  const [textInput, setTextInput] = useState("");
  const [selectedMessage, setSelectedMessage] = useState<string | null>(null);
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [currentModel, setCurrentModel] = useState<string>("");
  const [showHistory, setShowHistory] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Refs and hooks
  const scrollViewRef = useRef<ScrollView>(null);
  const aiService = useRef(new HumanizedAIService(GENAI_API_KEY));
  const { isKeyboardVisible, keyboardHeight } = useKeyboard();

  // Derived states
  const lastMessage = conversation[conversation.length - 1];
  const displayedText = useTypingEffect(
    lastMessage?.text || WELCOME_MESSAGE,
    !isProcessing && conversation.length > 0
  );
  const thinkingDots = useThinkingAnimation(isProcessing);
  const hasAvailableModels = useMemo(
    () => availableModels.length > 0,
    [availableModels]
  );
  const hasConversation = useMemo(
    () => conversation.length > 0,
    [conversation]
  );
  const contentPaddingBottom = isKeyboardVisible ? keyboardHeight + 80 : 100;

  // Initialize AI connection
  useEffect(() => {
    const initializeAI = async () => {
      const workingModels = await aiService.current.testModels(AI_MODELS);
      setAvailableModels(workingModels);
      setCurrentModel(workingModels[0] || "");
    };
    initializeAI();
  }, []);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (conversation.length > 0) {
      setTimeout(
        () => scrollViewRef.current?.scrollToEnd({ animated: true }),
        100
      );
    }
  }, [conversation.length]);

  // Quick response handler for common queries
  const getQuickResponse = useCallback((userInput: string): string | null => {
    const lowerInput = userInput.toLowerCase().trim();
    if (quickResponses[lowerInput]) return quickResponses[lowerInput];

    for (const [key, response] of Object.entries(quickResponses)) {
      if (lowerInput.includes(key) && key.length > 2) return response;
    }
    return null;
  }, []);

  // Send message to AI
  const sendToAI = useCallback(
    async (userInput: string) => {
      if (!hasAvailableModels) {
        Alert.alert(
          "Error",
          "No AI models available. Please check your connection."
        );
        return;
      }

      try {
        setIsProcessing(true);
        const userMessage: Message = {
          id: Date.now().toString(),
          role: "user",
          text: userInput,
          timestamp: new Date(),
        };
        setConversation((prev) => [...prev, userMessage]);

        const quickResponse = getQuickResponse(userInput);
        const responseText =
          quickResponse ||
          (await aiService.current.generateHumanizedResponse(
            currentModel,
            userInput
          ));

        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          text: responseText,
          timestamp: new Date(),
        };
        setConversation((prev) => [...prev, assistantMessage]);
      } catch (error) {
        console.error("Error calling AI:", error);
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          text: "Hmm, I'm having a bit of trouble right now. Could you try again in a moment?",
          timestamp: new Date(),
        };
        setConversation((prev) => [...prev, errorMessage]);
      } finally {
        setIsProcessing(false);
      }
    },
    [currentModel, hasAvailableModels, getQuickResponse]
  );

  // Event handlers
  const handleTextSubmit = useCallback(() => {
    if (textInput.trim() && !isProcessing && hasAvailableModels) {
      sendToAI(textInput.trim());
      setTextInput("");
      Keyboard.dismiss();
    }
  }, [textInput, isProcessing, hasAvailableModels, sendToAI]);

  const clearConversation = useCallback(() => {
    setConversation([]);
    setSelectedMessage(null);
  }, []);

  const showModelInfo = useCallback(() => {
    const title = hasAvailableModels ? "Connection Status" : "Connection Issue";
    const message = hasAvailableModels
      ? `✅ Connected to Gemini AI\n\nUsing model: ${currentModel}`
      : "Unable to connect to Gemini AI. Please check your API key and internet connection.";
    Alert.alert(title, message, [{ text: "OK" }]);
  }, [hasAvailableModels, currentModel]);

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
          showHistory={showHistory}
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
                { paddingBottom: contentPaddingBottom },
              ]}
              showsVerticalScrollIndicator={false}
            >
              {!hasConversation && (
                <View style={styles.welcomeContainer}>
                  <Text style={styles.welcomeTitle}>Hello! I'm YoVA 👋</Text>
                  <Text style={styles.welcomeSubtitle}>
                    Your friendly AI assistant here to help with anything you
                    need. What would you like to know?
                  </Text>
                </View>
              )}

              {conversation.map((message) => (
                <MessageBubble key={message.id} message={message} />
              ))}

              {isProcessing && (
                <MessageBubble
                  message={{
                    id: "thinking",
                    role: "assistant",
                    text: "",
                    timestamp: new Date(),
                  }}
                  thinkingDots={thinkingDots}
                />
              )}
            </ScrollView>
          </View>

          {/* History Sidebar */}
          {showHistory && hasConversation && (
            <HistorySidebar
              conversation={conversation}
              selectedMessage={selectedMessage}
              onSelectMessage={setSelectedMessage}
              onClose={() => setShowHistory(false)}
            />
          )}
        </View>

        {/* Input Bar */}
        <InputBar
          textInput={textInput}
          onTextChange={setTextInput}
          onSubmit={handleTextSubmit}
          isProcessing={isProcessing}
          hasAvailableModels={hasAvailableModels}
          onClear={clearConversation}
          hasConversation={hasConversation}
        />
      </LinearGradient>
    </View>
  );
}

// Styles remain the same as original
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
  headerRight: { flexDirection: "row" },
  headerCenter: { alignItems: "center" },
  headerTitle: { fontSize: 20, fontWeight: "700", color: "#F5C563" },
  headerSubtitle: {
    fontSize: 12,
    color: "#E8DDD3",
    opacity: 0.8,
    marginTop: 2,
  },
  content: { flex: 1, flexDirection: "row" },
  chatContainer: { flex: 1, marginRight: 12 },
  chatContainerFull: { marginRight: 0 },
  chatContent: { paddingHorizontal: 16, paddingTop: 20 },
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
  messageContainer: { marginBottom: 20, padding: 16, borderRadius: 12 },
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
  messageRole: { fontSize: 14, fontWeight: "600", color: "#F5C563", flex: 1 },
  messageTime: { fontSize: 12, color: "#8B7965" },
  messageText: { fontSize: 16, color: "#FFFFFF", lineHeight: 22 },
  thinkingContainer: { paddingVertical: 8 },
  thinkingText: { fontSize: 16, color: "#F5C563", fontStyle: "italic" },
  cursor: { color: "#F5C563", fontWeight: "bold" },
  inputBar: {
    backgroundColor: "rgba(26, 20, 16, 0.95)",
    borderTopWidth: 1,
    borderTopColor: "rgba(139, 121, 101, 0.3)",
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingBottom: 20,
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
  sendButtonDisabled: { backgroundColor: "#8B7965", opacity: 0.5 },
  clearButton: {
    alignSelf: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  clearButtonText: { color: "#8B7965", fontSize: 14, fontWeight: "500" },
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
  historyTitle: { fontSize: 14, fontWeight: "600", color: "#F5C563" },
  hideButton: { padding: 4 },
  hideButtonText: { color: "#F5C563", fontSize: 16, fontWeight: "bold" },
  historyList: { flex: 1, padding: 8 },
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
  historyIcon: { fontSize: 12, marginRight: 8 },
  historyText: { fontSize: 12, color: "#E8DDD3", lineHeight: 16, flex: 1 },
});
