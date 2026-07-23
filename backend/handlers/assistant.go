package handlers

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"strconv"
	"strings"
	"time"
)

const groqAPIURL = "https://api.groq.com/openai/v1/chat/completions"

// Model choice: llama-3.3-70b-versatile is Groq's best general-purpose free
// model - strong quality, still comfortably inside the free tier's daily
// request limits for a personal-assistant workload.
const groqModel = "llama-3.3-70b-versatile"

const yovaSystemPrompt = `You are YoVA (Your Virtual Assistant), a friendly and helpful AI assistant. Respond naturally and conversationally, like a quick text from a sharp friend - not a formal writeup.

Keep it short: 1-3 sentences for simple questions or chat, and a short paragraph (or a few brief bullet points) only when the question genuinely needs steps or a list. Never pad the reply with restating the question or unnecessary preamble. Avoid robotic language, use contractions, and skip markdown symbols like ** or * since this is plain chat text.`

type AssistantChatRequest struct {
	Message string `json:"message"`
}

type AssistantChatResponse struct {
	Reply string `json:"reply"`
}

type groqMessage struct {
	Role    string `json:"role"`
	Content string `json:"content"`
}

type groqChatRequest struct {
	Model       string        `json:"model"`
	Messages    []groqMessage `json:"messages"`
	Temperature float64       `json:"temperature"`
}

type groqChoice struct {
	Message groqMessage `json:"message"`
}

type groqErrorBody struct {
	Error struct {
		Message string `json:"message"`
	} `json:"error"`
}

type groqChatResponse struct {
	Choices []groqChoice `json:"choices"`
}

// AssistantChat proxies a chat message to Groq, keeping the API key on the
// server so it never ships inside the app bundle. Handles transient
// rate-limit/server errors with a short retry before giving up.
func AssistantChat(w http.ResponseWriter, r *http.Request) {
	var req AssistantChatRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil || strings.TrimSpace(req.Message) == "" {
		http.Error(w, `{"error": "Message is required"}`, http.StatusBadRequest)
		return
	}

	apiKey := os.Getenv("GROQ_API_KEY")
	if apiKey == "" {
		http.Error(w, `{"error": "AI service is not configured"}`, http.StatusInternalServerError)
		return
	}

	reply, err := callGroqWithRetry(apiKey, req.Message)
	if err != nil {
		http.Error(w, `{"error": "The assistant is having trouble right now. Please try again in a moment."}`, http.StatusBadGateway)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(AssistantChatResponse{Reply: reply})
}

func callGroqWithRetry(apiKey, userMessage string) (string, error) {
	const maxAttempts = 3
	var lastErr error

	for attempt := 0; attempt < maxAttempts; attempt++ {
		reply, retryAfter, err := callGroqOnce(apiKey, userMessage)
		if err == nil {
			return reply, nil
		}
		lastErr = err

		// Only retry on transient errors (rate limit / server overload);
		// anything else (e.g. bad request, auth failure) fails immediately.
		if !isRetryable(err) || attempt == maxAttempts-1 {
			break
		}

		delay := retryAfter
		if delay <= 0 {
			delay = time.Duration(500*(attempt+1)) * time.Millisecond
		}
		time.Sleep(delay)
	}

	return "", lastErr
}

type groqRetryableError struct {
	statusCode int
	message    string
}

func (e *groqRetryableError) Error() string {
	return fmt.Sprintf("groq request failed (%d): %s", e.statusCode, e.message)
}

func isRetryable(err error) bool {
	rErr, ok := err.(*groqRetryableError)
	if !ok {
		return true // network-level errors are worth a retry too
	}
	switch rErr.statusCode {
	case http.StatusTooManyRequests, http.StatusServiceUnavailable, http.StatusBadGateway, http.StatusGatewayTimeout, http.StatusInternalServerError:
		return true
	default:
		return false
	}
}

func callGroqOnce(apiKey, userMessage string) (string, time.Duration, error) {
	payload := groqChatRequest{
		Model: groqModel,
		Messages: []groqMessage{
			{Role: "system", Content: yovaSystemPrompt},
			{Role: "user", Content: userMessage},
		},
		Temperature: 0.7,
	}

	body, err := json.Marshal(payload)
	if err != nil {
		return "", 0, err
	}

	httpReq, err := http.NewRequest("POST", groqAPIURL, bytes.NewBuffer(body))
	if err != nil {
		return "", 0, err
	}
	httpReq.Header.Set("Authorization", "Bearer "+apiKey)
	httpReq.Header.Set("Content-Type", "application/json")

	client := &http.Client{Timeout: 30 * time.Second}
	resp, err := client.Do(httpReq)
	if err != nil {
		return "", 0, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		var errBody groqErrorBody
		json.NewDecoder(resp.Body).Decode(&errBody)

		retryAfter := parseRetryAfter(resp.Header.Get("Retry-After"))
		return "", retryAfter, &groqRetryableError{
			statusCode: resp.StatusCode,
			message:    errBody.Error.Message,
		}
	}

	var groqResp groqChatResponse
	if err := json.NewDecoder(resp.Body).Decode(&groqResp); err != nil {
		return "", 0, err
	}

	if len(groqResp.Choices) == 0 {
		return "", 0, fmt.Errorf("no choices returned from groq")
	}

	return groqResp.Choices[0].Message.Content, 0, nil
}

func parseRetryAfter(header string) time.Duration {
	if header == "" {
		return 0
	}
	seconds, err := strconv.Atoi(header)
	if err != nil {
		return 0
	}
	return time.Duration(seconds) * time.Second
}