package handlers

import (
	"context"
	"encoding/json"
	"net/http"
	"time"
	"yova-backend/database"
	"yova-backend/models"

	"github.com/gorilla/mux"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

// GetChats returns all chats for the authenticated user (only titles and IDs)
func GetChats(w http.ResponseWriter, r *http.Request) {
	userID, ok := r.Context().Value("userID").(string)
	if !ok {
		http.Error(w, `{"error": "User not authenticated"}`, http.StatusUnauthorized)
		return
	}

	// Convert userID string to ObjectID
	objID, err := primitive.ObjectIDFromHex(userID)
	if err != nil {
		http.Error(w, `{"error": "Invalid user ID"}`, http.StatusBadRequest)
		return
	}

	collection := database.GetCollection("chats")
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// Find all chats for this user, return only title, ID, and updatedAt
	cursor, err := collection.Find(ctx, bson.M{"userId": objID})
	if err != nil {
		http.Error(w, `{"error": "Failed to fetch chats"}`, http.StatusInternalServerError)
		return
	}
	defer cursor.Close(ctx)

	var chats []struct {
		ID        primitive.ObjectID `json:"_id" bson:"_id"`
		Title     string             `json:"title" bson:"title"`
		UpdatedAt time.Time          `json:"updatedAt" bson:"updatedAt"`
	}
	if err = cursor.All(ctx, &chats); err != nil {
		http.Error(w, `{"error": "Failed to decode chats"}`, http.StatusInternalServerError)
		return
	}

	// If no chats found, return empty array instead of null
	if chats == nil {
		chats = []struct {
			ID        primitive.ObjectID `json:"_id" bson:"_id"`
			Title     string             `json:"title" bson:"title"`
			UpdatedAt time.Time          `json:"updatedAt" bson:"updatedAt"`
		}{}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(chats)
}

// GetChat returns a single chat with all messages
func GetChat(w http.ResponseWriter, r *http.Request) {
	userID, ok := r.Context().Value("userID").(string)
	if !ok {
		http.Error(w, `{"error": "User not authenticated"}`, http.StatusUnauthorized)
		return
	}

	params := mux.Vars(r)
	chatID := params["id"]
	if chatID == "" {
		http.Error(w, `{"error": "Chat ID is required"}`, http.StatusBadRequest)
		return
	}

	// Convert IDs to ObjectID
	chatObjID, err := primitive.ObjectIDFromHex(chatID)
	if err != nil {
		http.Error(w, `{"error": "Invalid chat ID"}`, http.StatusBadRequest)
		return
	}

	userObjID, err := primitive.ObjectIDFromHex(userID)
	if err != nil {
		http.Error(w, `{"error": "Invalid user ID"}`, http.StatusBadRequest)
		return
	}

	collection := database.GetCollection("chats")
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	var chat models.Chat
	err = collection.FindOne(ctx, bson.M{"_id": chatObjID, "userId": userObjID}).Decode(&chat)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			http.Error(w, `{"error": "Chat not found"}`, http.StatusNotFound)
			return
		}
		http.Error(w, `{"error": "Failed to fetch chat"}`, http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(chat)
}

// CreateChat creates a new chat for the authenticated user
func CreateChat(w http.ResponseWriter, r *http.Request) {
	userID, ok := r.Context().Value("userID").(string)
	if !ok {
		http.Error(w, `{"error": "User not authenticated"}`, http.StatusUnauthorized)
		return
	}

	var req models.CreateChatRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, `{"error": "Invalid request body"}`, http.StatusBadRequest)
		return
	}

	// Convert userID string to ObjectID
	objID, err := primitive.ObjectIDFromHex(userID)
	if err != nil {
		http.Error(w, `{"error": "Invalid user ID"}`, http.StatusBadRequest)
		return
	}

	chat := models.Chat{
		ID:        primitive.NewObjectID(),
		Title:     req.Title,
		UserID:    objID,
		Messages:  []models.Message{},
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	collection := database.GetCollection("chats")
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	_, err = collection.InsertOne(ctx, chat)
	if err != nil {
		http.Error(w, `{"error": "Failed to create chat"}`, http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(chat)
}

// AddMessage adds a message to an existing chat
func AddMessage(w http.ResponseWriter, r *http.Request) {
	userID, ok := r.Context().Value("userID").(string)
	if !ok {
		http.Error(w, `{"error": "User not authenticated"}`, http.StatusUnauthorized)
		return
	}

	var req models.AddMessageRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, `{"error": "Invalid request body"}`, http.StatusBadRequest)
		return
	}

	// Convert IDs to ObjectID
	chatObjID, err := primitive.ObjectIDFromHex(req.ChatID)
	if err != nil {
		http.Error(w, `{"error": "Invalid chat ID"}`, http.StatusBadRequest)
		return
	}

	userObjID, err := primitive.ObjectIDFromHex(userID)
	if err != nil {
		http.Error(w, `{"error": "Invalid user ID"}`, http.StatusBadRequest)
		return
	}

	collection := database.GetCollection("chats")
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// Update only if the chat belongs to the user
	result, err := collection.UpdateOne(
		ctx,
		bson.M{"_id": chatObjID, "userId": userObjID},
		bson.M{
			"$push": bson.M{"messages": req.Message},
			"$set":  bson.M{"updatedAt": time.Now()},
		},
	)

	if err != nil {
		http.Error(w, `{"error": "Failed to add message"}`, http.StatusInternalServerError)
		return
	}

	if result.MatchedCount == 0 {
		http.Error(w, `{"error": "Chat not found"}`, http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"message": "Message added successfully"})
}

// UpdateChatTitle updates the title of a chat
func UpdateChatTitle(w http.ResponseWriter, r *http.Request) {
	userID, ok := r.Context().Value("userID").(string)
	if !ok {
		http.Error(w, `{"error": "User not authenticated"}`, http.StatusUnauthorized)
		return
	}

	params := mux.Vars(r)
	chatID := params["id"]
	if chatID == "" {
		http.Error(w, `{"error": "Chat ID is required"}`, http.StatusBadRequest)
		return
	}

	var req models.UpdateChatTitleRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, `{"error": "Invalid request body"}`, http.StatusBadRequest)
		return
	}

	// Convert IDs to ObjectID
	chatObjID, err := primitive.ObjectIDFromHex(chatID)
	if err != nil {
		http.Error(w, `{"error": "Invalid chat ID"}`, http.StatusBadRequest)
		return
	}

	userObjID, err := primitive.ObjectIDFromHex(userID)
	if err != nil {
		http.Error(w, `{"error": "Invalid user ID"}`, http.StatusBadRequest)
		return
	}

	collection := database.GetCollection("chats")
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// Update only if the chat belongs to the user
	result, err := collection.UpdateOne(
		ctx,
		bson.M{"_id": chatObjID, "userId": userObjID},
		bson.M{
			"$set": bson.M{
				"title":     req.Title,
				"updatedAt": time.Now(),
			},
		},
	)

	if err != nil {
		http.Error(w, `{"error": "Failed to update chat title"}`, http.StatusInternalServerError)
		return
	}

	if result.MatchedCount == 0 {
		http.Error(w, `{"error": "Chat not found"}`, http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"message": "Chat title updated successfully"})
}

// DeleteChat deletes a chat
func DeleteChat(w http.ResponseWriter, r *http.Request) {
	userID, ok := r.Context().Value("userID").(string)
	if !ok {
		http.Error(w, `{"error": "User not authenticated"}`, http.StatusUnauthorized)
		return
	}

	params := mux.Vars(r)
	chatID := params["id"]
	if chatID == "" {
		http.Error(w, `{"error": "Chat ID is required"}`, http.StatusBadRequest)
		return
	}

	// Convert IDs to ObjectID
	chatObjID, err := primitive.ObjectIDFromHex(chatID)
	if err != nil {
		http.Error(w, `{"error": "Invalid chat ID"}`, http.StatusBadRequest)
		return
	}

	userObjID, err := primitive.ObjectIDFromHex(userID)
	if err != nil {
		http.Error(w, `{"error": "Invalid user ID"}`, http.StatusBadRequest)
		return
	}

	collection := database.GetCollection("chats")
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// Delete only if the chat belongs to the user
	result, err := collection.DeleteOne(ctx, bson.M{"_id": chatObjID, "userId": userObjID})
	if err != nil {
		http.Error(w, `{"error": "Failed to delete chat"}`, http.StatusInternalServerError)
		return
	}

	if result.DeletedCount == 0 {
		http.Error(w, `{"error": "Chat not found"}`, http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"message": "Chat deleted successfully"})
}
