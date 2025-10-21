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

// GetTasks returns all tasks for the authenticated user
func GetTasks(w http.ResponseWriter, r *http.Request) {
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

	collection := database.GetCollection("tasks")
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// Find all tasks for this user, sorted by creation date (newest first)
	cursor, err := collection.Find(ctx, bson.M{"userId": objID})
	if err != nil {
		http.Error(w, `{"error": "Failed to fetch tasks"}`, http.StatusInternalServerError)
		return
	}
	defer cursor.Close(ctx)

	var tasks []models.Task
	if err = cursor.All(ctx, &tasks); err != nil {
		http.Error(w, `{"error": "Failed to decode tasks"}`, http.StatusInternalServerError)
		return
	}

	// If no tasks found, return empty array instead of null
	if tasks == nil {
		tasks = []models.Task{}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(tasks)
}

// CreateTask creates a new task for the authenticated user
func CreateTask(w http.ResponseWriter, r *http.Request) {
	userID, ok := r.Context().Value("userID").(string)
	if !ok {
		http.Error(w, `{"error": "User not authenticated"}`, http.StatusUnauthorized)
		return
	}

	var req models.CreateTaskRequest
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

	task := models.Task{
		ID:          primitive.NewObjectID(),
		Title:       req.Title,
		IsCompleted: false,
		UserID:      objID,
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
	}

	collection := database.GetCollection("tasks")
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	_, err = collection.InsertOne(ctx, task)
	if err != nil {
		http.Error(w, `{"error": "Failed to create task"}`, http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(task)
}

// GetTask returns a single task by ID
func GetTask(w http.ResponseWriter, r *http.Request) {
	userID, ok := r.Context().Value("userID").(string)
	if !ok {
		http.Error(w, `{"error": "User not authenticated"}`, http.StatusUnauthorized)
		return
	}

	params := mux.Vars(r)
	taskID := params["id"]
	if taskID == "" {
		http.Error(w, `{"error": "Task ID is required"}`, http.StatusBadRequest)
		return
	}

	// Convert IDs to ObjectID
	taskObjID, err := primitive.ObjectIDFromHex(taskID)
	if err != nil {
		http.Error(w, `{"error": "Invalid task ID"}`, http.StatusBadRequest)
		return
	}

	userObjID, err := primitive.ObjectIDFromHex(userID)
	if err != nil {
		http.Error(w, `{"error": "Invalid user ID"}`, http.StatusBadRequest)
		return
	}

	collection := database.GetCollection("tasks")
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	var task models.Task
	err = collection.FindOne(ctx, bson.M{"_id": taskObjID, "userId": userObjID}).Decode(&task)
	if err != nil {
		if err == mongo.ErrNoDocuments {
			http.Error(w, `{"error": "Task not found"}`, http.StatusNotFound)
			return
		}
		http.Error(w, `{"error": "Failed to fetch task"}`, http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(task)
}

// UpdateTask updates an existing task
func UpdateTask(w http.ResponseWriter, r *http.Request) {
	userID, ok := r.Context().Value("userID").(string)
	if !ok {
		http.Error(w, `{"error": "User not authenticated"}`, http.StatusUnauthorized)
		return
	}

	params := mux.Vars(r)
	taskID := params["id"]
	if taskID == "" {
		http.Error(w, `{"error": "Task ID is required"}`, http.StatusBadRequest)
		return
	}

	// Convert IDs to ObjectID
	taskObjID, err := primitive.ObjectIDFromHex(taskID)
	if err != nil {
		http.Error(w, `{"error": "Invalid task ID"}`, http.StatusBadRequest)
		return
	}

	userObjID, err := primitive.ObjectIDFromHex(userID)
	if err != nil {
		http.Error(w, `{"error": "Invalid user ID"}`, http.StatusBadRequest)
		return
	}

	var req models.UpdateTaskRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, `{"error": "Invalid request body"}`, http.StatusBadRequest)
		return
	}

	collection := database.GetCollection("tasks")
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// Update only if the task belongs to the user
	result, err := collection.UpdateOne(
		ctx,
		bson.M{"_id": taskObjID, "userId": userObjID},
		bson.M{
			"$set": bson.M{
				"title":        req.Title,
				"is_completed": req.IsCompleted,
				"updatedAt":    time.Now(),
			},
		},
	)

	if err != nil {
		http.Error(w, `{"error": "Failed to update task"}`, http.StatusInternalServerError)
		return
	}

	if result.MatchedCount == 0 {
		http.Error(w, `{"error": "Task not found"}`, http.StatusNotFound)
		return
	}

	// Fetch and return the updated task
	var updatedTask models.Task
	err = collection.FindOne(ctx, bson.M{"_id": taskObjID}).Decode(&updatedTask)
	if err != nil {
		http.Error(w, `{"error": "Failed to fetch updated task"}`, http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(updatedTask)
}

// DeleteTask deletes a task
func DeleteTask(w http.ResponseWriter, r *http.Request) {
	userID, ok := r.Context().Value("userID").(string)
	if !ok {
		http.Error(w, `{"error": "User not authenticated"}`, http.StatusUnauthorized)
		return
	}

	params := mux.Vars(r)
	taskID := params["id"]
	if taskID == "" {
		http.Error(w, `{"error": "Task ID is required"}`, http.StatusBadRequest)
		return
	}

	// Convert IDs to ObjectID
	taskObjID, err := primitive.ObjectIDFromHex(taskID)
	if err != nil {
		http.Error(w, `{"error": "Invalid task ID"}`, http.StatusBadRequest)
		return
	}

	userObjID, err := primitive.ObjectIDFromHex(userID)
	if err != nil {
		http.Error(w, `{"error": "Invalid user ID"}`, http.StatusBadRequest)
		return
	}

	collection := database.GetCollection("tasks")
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// Delete only if the task belongs to the user
	result, err := collection.DeleteOne(ctx, bson.M{"_id": taskObjID, "userId": userObjID})
	if err != nil {
		http.Error(w, `{"error": "Failed to delete task"}`, http.StatusInternalServerError)
		return
	}

	if result.DeletedCount == 0 {
		http.Error(w, `{"error": "Task not found"}`, http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"message": "Task deleted successfully"})
}

// DeleteCompletedTasks deletes all completed tasks for the user
func DeleteCompletedTasks(w http.ResponseWriter, r *http.Request) {
	userID, ok := r.Context().Value("userID").(string)
	if !ok {
		http.Error(w, `{"error": "User not authenticated"}`, http.StatusUnauthorized)
		return
	}

	// Convert userID string to ObjectID
	userObjID, err := primitive.ObjectIDFromHex(userID)
	if err != nil {
		http.Error(w, `{"error": "Invalid user ID"}`, http.StatusBadRequest)
		return
	}

	collection := database.GetCollection("tasks")
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// Delete all completed tasks for the user
	result, err := collection.DeleteMany(ctx, bson.M{"userId": userObjID, "is_completed": true})
	if err != nil {
		http.Error(w, `{"error": "Failed to delete completed tasks"}`, http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"message":      "Completed tasks deleted successfully",
		"deletedCount": result.DeletedCount,
	})
}
