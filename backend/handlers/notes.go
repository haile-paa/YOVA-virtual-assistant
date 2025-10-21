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

// GetNotes returns all notes for the authenticated user
func GetNotes(w http.ResponseWriter, r *http.Request) {
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

	collection := database.GetCollection("notes")
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// Find all notes for this user, sorted by creation date (newest first)
	cursor, err := collection.Find(ctx, bson.M{"userId": objID})
	if err != nil {
		http.Error(w, `{"error": "Failed to fetch notes"}`, http.StatusInternalServerError)
		return
	}
	defer cursor.Close(ctx)

	var notes []models.Note
	if err = cursor.All(ctx, &notes); err != nil {
		http.Error(w, `{"error": "Failed to decode notes"}`, http.StatusInternalServerError)
		return
	}

	// If no notes found, return empty array instead of null
	if notes == nil {
		notes = []models.Note{}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(notes)
}

// CreateNote creates a new note for the authenticated user
func CreateNote(w http.ResponseWriter, r *http.Request) {
	userID, ok := r.Context().Value("userID").(string)
	if !ok {
		http.Error(w, `{"error": "User not authenticated"}`, http.StatusUnauthorized)
		return
	}

	var req models.CreateNoteRequest
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

	note := models.Note{
		ID:        primitive.NewObjectID(),
		Title:     req.Title,
		Content:   req.Content,
		UserID:    objID,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	collection := database.GetCollection("notes")
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	_, err = collection.InsertOne(ctx, note)
	if err != nil {
		http.Error(w, `{"error": "Failed to create note"}`, http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(note)
}

// GetNote returns a single note by ID
func GetNote(w http.ResponseWriter, r *http.Request) {
	userID, ok := r.Context().Value("userID").(string)
	if !ok {
		http.Error(w, `{"error": "User not authenticated"}`, http.StatusUnauthorized)
		return
	}

	params := mux.Vars(r)
	noteID := params["id"]
	if noteID == "" {
		http.Error(w, `{"error": "Note ID is required"}`, http.StatusBadRequest)
		return
	}

	// Convert IDs to ObjectID
	noteObjID, err := primitive.ObjectIDFromHex(noteID)
	if err != nil {
		http.Error(w, `{"error": "Invalid note ID"}`, http.StatusBadRequest)
		return
	}

	userObjID, err := primitive.ObjectIDFromHex(userID)
	if err != nil {
		http.Error(w, `{"error": "Invalid user ID"}`, http.StatusBadRequest)
		return
	}

	collection := database.GetCollection("notes")
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	var note models.Note
	err = collection.FindOne(ctx, bson.M{"_id": noteObjID, "userId": userObjID}).Decode(&note)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			http.Error(w, `{"error": "Note not found"}`, http.StatusNotFound)
			return
		}
		http.Error(w, `{"error": "Failed to fetch note"}`, http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(note)
}

// UpdateNote updates an existing note
func UpdateNote(w http.ResponseWriter, r *http.Request) {
	userID, ok := r.Context().Value("userID").(string)
	if !ok {
		http.Error(w, `{"error": "User not authenticated"}`, http.StatusUnauthorized)
		return
	}

	params := mux.Vars(r)
	noteID := params["id"]
	if noteID == "" {
		http.Error(w, `{"error": "Note ID is required"}`, http.StatusBadRequest)
		return
	}

	// Convert IDs to ObjectID
	noteObjID, err := primitive.ObjectIDFromHex(noteID)
	if err != nil {
		http.Error(w, `{"error": "Invalid note ID"}`, http.StatusBadRequest)
		return
	}

	userObjID, err := primitive.ObjectIDFromHex(userID)
	if err != nil {
		http.Error(w, `{"error": "Invalid user ID"}`, http.StatusBadRequest)
		return
	}

	var req models.UpdateNoteRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, `{"error": "Invalid request body"}`, http.StatusBadRequest)
		return
	}

	collection := database.GetCollection("notes")
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// Update only if the note belongs to the user
	result, err := collection.UpdateOne(
		ctx,
		bson.M{"_id": noteObjID, "userId": userObjID},
		bson.M{
			"$set": bson.M{
				"title":     req.Title,
				"content":   req.Content,
				"updatedAt": time.Now(),
			},
		},
	)

	if err != nil {
		http.Error(w, `{"error": "Failed to update note"}`, http.StatusInternalServerError)
		return
	}

	if result.MatchedCount == 0 {
		http.Error(w, `{"error": "Note not found"}`, http.StatusNotFound)
		return
	}

	// Fetch and return the updated note
	var updatedNote models.Note
	err = collection.FindOne(ctx, bson.M{"_id": noteObjID}).Decode(&updatedNote)
	if err != nil {
		http.Error(w, `{"error": "Failed to fetch updated note"}`, http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(updatedNote)
}

// DeleteNote deletes a note
func DeleteNote(w http.ResponseWriter, r *http.Request) {
	userID, ok := r.Context().Value("userID").(string)
	if !ok {
		http.Error(w, `{"error": "User not authenticated"}`, http.StatusUnauthorized)
		return
	}

	params := mux.Vars(r)
	noteID := params["id"]
	if noteID == "" {
		http.Error(w, `{"error": "Note ID is required"}`, http.StatusBadRequest)
		return
	}

	// Convert IDs to ObjectID
	noteObjID, err := primitive.ObjectIDFromHex(noteID)
	if err != nil {
		http.Error(w, `{"error": "Invalid note ID"}`, http.StatusBadRequest)
		return
	}

	userObjID, err := primitive.ObjectIDFromHex(userID)
	if err != nil {
		http.Error(w, `{"error": "Invalid user ID"}`, http.StatusBadRequest)
		return
	}

	collection := database.GetCollection("notes")
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// Delete only if the note belongs to the user
	result, err := collection.DeleteOne(ctx, bson.M{"_id": noteObjID, "userId": userObjID})
	if err != nil {
		http.Error(w, `{"error": "Failed to delete note"}`, http.StatusInternalServerError)
		return
	}

	if result.DeletedCount == 0 {
		http.Error(w, `{"error": "Note not found"}`, http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"message": "Note deleted successfully"})
}
