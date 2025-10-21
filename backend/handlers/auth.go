package handlers

import (
	"context"
	"encoding/json"
	"net/http"
	"time"
	"yova-backend/database"
	"yova-backend/models"
	"yova-backend/utils"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

// Helper function to send JSON errors
func sendJSONError(w http.ResponseWriter, message string, statusCode int) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(statusCode)
	json.NewEncoder(w).Encode(map[string]string{"error": message})
}

// Helper function to send JSON responses
func sendJSONResponse(w http.ResponseWriter, data interface{}, statusCode int) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(statusCode)
	json.NewEncoder(w).Encode(data)
}

// UpdateProfileRequest defines the request structure for updating profile
type UpdateProfileRequest struct {
	FirstName string `json:"firstName" binding:"required"`
	LastName  string `json:"lastName" binding:"required"`
	Email     string `json:"email" binding:"required,email"`
}

func Signup(w http.ResponseWriter, r *http.Request) {
	// Check if it's a POST request
	if r.Method != "POST" {
		sendJSONError(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req models.SignupRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		sendJSONError(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Validate required fields
	if req.FirstName == "" || req.LastName == "" || req.Email == "" || req.Password == "" {
		sendJSONError(w, "All fields are required", http.StatusBadRequest)
		return
	}

	// Check if user already exists - FIXED VERSION
	var existingUser models.User
	err := database.UserCollection.FindOne(context.TODO(), bson.M{"email": req.Email}).Decode(&existingUser)

	// If no error, that means user was found (user exists)
	if err == nil {
		sendJSONError(w, "User already exists", http.StatusConflict)
		return
	}

	// If error is NOT "no documents" (meaning some other error occurred)
	if err != nil && err != mongo.ErrNoDocuments {
		sendJSONError(w, "Database error: "+err.Error(), http.StatusInternalServerError)
		return
	}

	// If we get here, no user exists with this email (err == mongo.ErrNoDocuments)

	// Create new user
	user := models.User{
		ID:        primitive.NewObjectID(),
		FirstName: req.FirstName,
		LastName:  req.LastName,
		Email:     req.Email,
		Password:  req.Password,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	if err := user.HashPassword(); err != nil {
		sendJSONError(w, "Error creating user: "+err.Error(), http.StatusInternalServerError)
		return
	}

	_, err = database.UserCollection.InsertOne(context.TODO(), user)
	if err != nil {
		sendJSONError(w, "Error creating user: "+err.Error(), http.StatusInternalServerError)
		return
	}

	// Generate token
	token, err := utils.GenerateToken(user.ID.Hex(), user.Email)
	if err != nil {
		sendJSONError(w, "Error generating token: "+err.Error(), http.StatusInternalServerError)
		return
	}

	// Create response user (without password)
	responseUser := map[string]interface{}{
		"id":        user.ID,
		"firstName": user.FirstName,
		"lastName":  user.LastName,
		"email":     user.Email,
		"createdAt": user.CreatedAt,
		"updatedAt": user.UpdatedAt,
	}

	response := map[string]interface{}{
		"token": token,
		"user":  responseUser,
	}

	sendJSONResponse(w, response, http.StatusCreated) // Use 201 for resource creation
}

func Login(w http.ResponseWriter, r *http.Request) {
	// Check if it's a POST request
	if r.Method != "POST" {
		sendJSONError(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req models.LoginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		sendJSONError(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Validate required fields
	if req.Email == "" || req.Password == "" {
		sendJSONError(w, "Email and password are required", http.StatusBadRequest)
		return
	}

	// Find user
	var user models.User
	err := database.UserCollection.FindOne(context.TODO(), bson.M{"email": req.Email}).Decode(&user)
	if err != nil {
		sendJSONError(w, "Invalid credentials", http.StatusUnauthorized)
		return
	}

	// Check password
	if !user.CheckPassword(req.Password) {
		sendJSONError(w, "Invalid credentials", http.StatusUnauthorized)
		return
	}

	// Generate token
	token, err := utils.GenerateToken(user.ID.Hex(), user.Email)
	if err != nil {
		sendJSONError(w, "Error generating token", http.StatusInternalServerError)
		return
	}

	// Create response user (without password)
	responseUser := map[string]interface{}{
		"id":        user.ID,
		"firstName": user.FirstName,
		"lastName":  user.LastName,
		"email":     user.Email,
		"createdAt": user.CreatedAt,
		"updatedAt": user.UpdatedAt,
	}

	response := map[string]interface{}{
		"token": token,
		"user":  responseUser,
	}

	sendJSONResponse(w, response, http.StatusOK)
}

func VerifyToken(w http.ResponseWriter, r *http.Request) {
	sendJSONResponse(w, map[string]bool{"valid": true}, http.StatusOK)
}

func GetProfile(w http.ResponseWriter, r *http.Request) {
	userID, ok := r.Context().Value("userID").(string)
	if !ok {
		sendJSONError(w, "Invalid token claims", http.StatusUnauthorized)
		return
	}

	var user models.User
	objID, err := primitive.ObjectIDFromHex(userID)
	if err != nil {
		sendJSONError(w, "Invalid user ID", http.StatusBadRequest)
		return
	}

	err = database.UserCollection.FindOne(context.TODO(), bson.M{"_id": objID}).Decode(&user)
	if err != nil {
		sendJSONError(w, "User not found", http.StatusNotFound)
		return
	}

	// Return user data without password
	profileResponse := map[string]interface{}{
		"id":        user.ID,
		"firstName": user.FirstName,
		"lastName":  user.LastName,
		"email":     user.Email,
		"createdAt": user.CreatedAt,
		"updatedAt": user.UpdatedAt,
	}

	sendJSONResponse(w, profileResponse, http.StatusOK)
}

func UpdateProfile(w http.ResponseWriter, r *http.Request) {
	userID, ok := r.Context().Value("userID").(string)
	if !ok {
		sendJSONError(w, "Invalid token claims", http.StatusUnauthorized)
		return
	}

	var req UpdateProfileRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		sendJSONError(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Convert userID string to ObjectID
	objID, err := primitive.ObjectIDFromHex(userID)
	if err != nil {
		sendJSONError(w, "Invalid user ID", http.StatusBadRequest)
		return
	}

	// Check if email is already taken by another user
	var existingUser models.User
	err = database.UserCollection.FindOne(context.TODO(), bson.M{
		"email": req.Email,
		"_id":   bson.M{"$ne": objID},
	}).Decode(&existingUser)

	if err == nil {
		sendJSONError(w, "Email is already taken", http.StatusConflict)
		return
	} else if err != mongo.ErrNoDocuments {
		sendJSONError(w, "Failed to check email availability", http.StatusInternalServerError)
		return
	}

	// Update user profile
	result, err := database.UserCollection.UpdateOne(
		context.TODO(),
		bson.M{"_id": objID},
		bson.M{
			"$set": bson.M{
				"firstName": req.FirstName,
				"lastName":  req.LastName,
				"email":     req.Email,
				"updatedAt": time.Now(),
			},
		},
	)

	if err != nil {
		sendJSONError(w, "Failed to update profile", http.StatusInternalServerError)
		return
	}

	if result.MatchedCount == 0 {
		sendJSONError(w, "User not found", http.StatusNotFound)
		return
	}

	// Fetch and return updated user data
	var updatedUser models.User
	err = database.UserCollection.FindOne(context.TODO(), bson.M{"_id": objID}).Decode(&updatedUser)
	if err != nil {
		sendJSONError(w, "Failed to fetch updated profile", http.StatusInternalServerError)
		return
	}

	// Return updated user data without password
	profileResponse := map[string]interface{}{
		"id":        updatedUser.ID,
		"firstName": updatedUser.FirstName,
		"lastName":  updatedUser.LastName,
		"email":     updatedUser.Email,
		"createdAt": updatedUser.CreatedAt,
		"updatedAt": updatedUser.UpdatedAt,
		"message":   "Profile updated successfully",
	}

	sendJSONResponse(w, profileResponse, http.StatusOK)
}
