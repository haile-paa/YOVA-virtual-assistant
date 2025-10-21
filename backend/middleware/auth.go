package middleware

import (
	"context"
	"net/http"
	"strings"
	"yova-backend/utils"
)

// AuthMiddleware now returns the correct middleware signature
func AuthMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		authHeader := r.Header.Get("Authorization")
		if authHeader == "" {
			http.Error(w, `{"error": "Authorization header required"}`, http.StatusUnauthorized)
			return
		}

		tokenString := strings.TrimPrefix(authHeader, "Bearer ")
		if tokenString == authHeader {
			http.Error(w, `{"error": "Bearer token required"}`, http.StatusUnauthorized)
			return
		}

		claims, err := utils.VerifyToken(tokenString)
		if err != nil {
			http.Error(w, `{"error": "Invalid token"}`, http.StatusUnauthorized)
			return
		}

		// Extract userID from claims and set it in context
		// Assuming your claims has a UserID field - adjust based on your actual claims structure
		userID := claims.UserID // or claims["userID"] depending on your claims structure

		ctx := context.WithValue(r.Context(), "userID", userID)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

// Helper function for protecting specific handlers
func ProtectHandler(handler http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		authHeader := r.Header.Get("Authorization")
		if authHeader == "" {
			http.Error(w, `{"error": "Authorization header required"}`, http.StatusUnauthorized)
			return
		}

		tokenString := strings.TrimPrefix(authHeader, "Bearer ")
		if tokenString == authHeader {
			http.Error(w, `{"error": "Bearer token required"}`, http.StatusUnauthorized)
			return
		}

		claims, err := utils.VerifyToken(tokenString)
		if err != nil {
			http.Error(w, `{"error": "Invalid token"}`, http.StatusUnauthorized)
			return
		}

		// Extract userID from claims
		userID := claims.UserID // or claims["userID"]

		ctx := context.WithValue(r.Context(), "userID", userID)
		handler(w, r.WithContext(ctx))
	}
}
