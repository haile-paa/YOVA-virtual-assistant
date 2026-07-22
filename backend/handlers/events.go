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

// GetEvents returns all events for the authenticated user
func GetEvents(w http.ResponseWriter, r *http.Request) {
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

	collection := database.GetCollection("events")
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// Find all events for this user, sorted by creation date (newest first)
	cursor, err := collection.Find(ctx, bson.M{"userId": objID})
	if err != nil {
		http.Error(w, `{"error": "Failed to fetch events"}`, http.StatusInternalServerError)
		return
	}
	defer cursor.Close(ctx)

	var events []models.Event
	if err = cursor.All(ctx, &events); err != nil {
		http.Error(w, `{"error": "Failed to decode events"}`, http.StatusInternalServerError)
		return
	}

	// If no events found, return empty array instead of null
	if events == nil {
		events = []models.Event{}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(events)
}

// CreateEvent creates a new event for the authenticated user
func CreateEvent(w http.ResponseWriter, r *http.Request) {
	userID, ok := r.Context().Value("userID").(string)
	if !ok {
		http.Error(w, `{"error": "User not authenticated"}`, http.StatusUnauthorized)
		return
	}

	var req models.CreateEventRequest
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

	event := models.Event{
		ID:        primitive.NewObjectID(),
		Title:     req.Title,
		Day:       req.Day,
		Time:      req.Time,
		UserID:    objID,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	collection := database.GetCollection("events")
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	_, err = collection.InsertOne(ctx, event)
	if err != nil {
		http.Error(w, `{"error": "Failed to create event"}`, http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(event)
}

// GetEvent returns a single event by ID
func GetEvent(w http.ResponseWriter, r *http.Request) {
	userID, ok := r.Context().Value("userID").(string)
	if !ok {
		http.Error(w, `{"error": "User not authenticated"}`, http.StatusUnauthorized)
		return
	}

	params := mux.Vars(r)
	eventID := params["id"]
	if eventID == "" {
		http.Error(w, `{"error": "Event ID is required"}`, http.StatusBadRequest)
		return
	}

	// Convert IDs to ObjectID
	eventObjID, err := primitive.ObjectIDFromHex(eventID)
	if err != nil {
		http.Error(w, `{"error": "Invalid event ID"}`, http.StatusBadRequest)
		return
	}

	userObjID, err := primitive.ObjectIDFromHex(userID)
	if err != nil {
		http.Error(w, `{"error": "Invalid user ID"}`, http.StatusBadRequest)
		return
	}

	collection := database.GetCollection("events")
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	var event models.Event
	err = collection.FindOne(ctx, bson.M{"_id": eventObjID, "userId": userObjID}).Decode(&event)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			http.Error(w, `{"error": "Event not found"}`, http.StatusNotFound)
			return
		}
		http.Error(w, `{"error": "Failed to fetch event"}`, http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(event)
}

// UpdateEvent updates an existing event
func UpdateEvent(w http.ResponseWriter, r *http.Request) {
	userID, ok := r.Context().Value("userID").(string)
	if !ok {
		http.Error(w, `{"error": "User not authenticated"}`, http.StatusUnauthorized)
		return
	}

	params := mux.Vars(r)
	eventID := params["id"]
	if eventID == "" {
		http.Error(w, `{"error": "Event ID is required"}`, http.StatusBadRequest)
		return
	}

	// Convert IDs to ObjectID
	eventObjID, err := primitive.ObjectIDFromHex(eventID)
	if err != nil {
		http.Error(w, `{"error": "Invalid event ID"}`, http.StatusBadRequest)
		return
	}

	userObjID, err := primitive.ObjectIDFromHex(userID)
	if err != nil {
		http.Error(w, `{"error": "Invalid user ID"}`, http.StatusBadRequest)
		return
	}

	var req models.UpdateEventRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, `{"error": "Invalid request body"}`, http.StatusBadRequest)
		return
	}

	collection := database.GetCollection("events")
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// Update only if the event belongs to the user
	result, err := collection.UpdateOne(
		ctx,
		bson.M{"_id": eventObjID, "userId": userObjID},
		bson.M{
			"$set": bson.M{
				"title":     req.Title,
				"day":       req.Day,
				"time":      req.Time,
				"updatedAt": time.Now(),
			},
		},
	)

	if err != nil {
		http.Error(w, `{"error": "Failed to update event"}`, http.StatusInternalServerError)
		return
	}

	if result.MatchedCount == 0 {
		http.Error(w, `{"error": "Event not found"}`, http.StatusNotFound)
		return
	}

	// Fetch and return the updated event
	var updatedEvent models.Event
	err = collection.FindOne(ctx, bson.M{"_id": eventObjID}).Decode(&updatedEvent)
	if err != nil {
		http.Error(w, `{"error": "Failed to fetch updated event"}`, http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(updatedEvent)
}

// DeleteEvent deletes an event
func DeleteEvent(w http.ResponseWriter, r *http.Request) {
	userID, ok := r.Context().Value("userID").(string)
	if !ok {
		http.Error(w, `{"error": "User not authenticated"}`, http.StatusUnauthorized)
		return
	}

	params := mux.Vars(r)
	eventID := params["id"]
	if eventID == "" {
		http.Error(w, `{"error": "Event ID is required"}`, http.StatusBadRequest)
		return
	}

	// Convert IDs to ObjectID
	eventObjID, err := primitive.ObjectIDFromHex(eventID)
	if err != nil {
		http.Error(w, `{"error": "Invalid event ID"}`, http.StatusBadRequest)
		return
	}

	userObjID, err := primitive.ObjectIDFromHex(userID)
	if err != nil {
		http.Error(w, `{"error": "Invalid user ID"}`, http.StatusBadRequest)
		return
	}

	collection := database.GetCollection("events")
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// Delete only if the event belongs to the user
	result, err := collection.DeleteOne(ctx, bson.M{"_id": eventObjID, "userId": userObjID})
	if err != nil {
		http.Error(w, `{"error": "Failed to delete event"}`, http.StatusInternalServerError)
		return
	}

	if result.DeletedCount == 0 {
		http.Error(w, `{"error": "Event not found"}`, http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"message": "Event deleted successfully"})
}

// DeleteAllEvents deletes every event belonging to the authenticated user.
// Backs the "Clear All Data" action in Settings.
func DeleteAllEvents(w http.ResponseWriter, r *http.Request) {
	userID, ok := r.Context().Value("userID").(string)
	if !ok {
		http.Error(w, `{"error": "User not authenticated"}`, http.StatusUnauthorized)
		return
	}

	userObjID, err := primitive.ObjectIDFromHex(userID)
	if err != nil {
		http.Error(w, `{"error": "Invalid user ID"}`, http.StatusBadRequest)
		return
	}

	collection := database.GetCollection("events")
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	result, err := collection.DeleteMany(ctx, bson.M{"userId": userObjID})
	if err != nil {
		http.Error(w, `{"error": "Failed to clear events"}`, http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"message":      "All events cleared successfully",
		"deletedCount": result.DeletedCount,
	})
}
