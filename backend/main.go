package main

import (
	"log"
	"net/http"
	"os"
	"yova-backend/database"
	"yova-backend/handlers"
	"yova-backend/middleware"

	"github.com/gorilla/mux"
	"github.com/joho/godotenv"
)

func main() {
	// Load environment variables
	err := godotenv.Load()
	if err != nil {
		log.Println("Warning: .env file not found, using system environment variables")
	}

	// Initialize MongoDB connection
	database.InitDB()

	r := mux.NewRouter()

	// Public routes
	r.HandleFunc("/api/signup", handlers.Signup).Methods("POST")
	r.HandleFunc("/api/login", handlers.Login).Methods("POST")
	r.HandleFunc("/api/verify", middleware.ProtectHandler(handlers.VerifyToken)).Methods("GET")

	// Protected routes - using the middleware
	protected := r.PathPrefix("/api/protected").Subrouter()
	protected.Use(middleware.AuthMiddleware)
	protected.HandleFunc("/profile", handlers.GetProfile).Methods("GET")
	protected.HandleFunc("/profile", handlers.UpdateProfile).Methods("PUT")

	// Notes routes - protected
	notes := r.PathPrefix("/api/notes").Subrouter()
	notes.Use(middleware.AuthMiddleware)
	notes.HandleFunc("", handlers.GetNotes).Methods("GET")
	notes.HandleFunc("", handlers.CreateNote).Methods("POST")
	notes.HandleFunc("/{id}", handlers.GetNote).Methods("GET")
	notes.HandleFunc("/{id}", handlers.UpdateNote).Methods("PUT")
	notes.HandleFunc("/{id}", handlers.DeleteNote).Methods("DELETE")

	// Events routes - protected
	events := r.PathPrefix("/api/events").Subrouter()
	events.Use(middleware.AuthMiddleware)
	events.HandleFunc("", handlers.GetEvents).Methods("GET")
	events.HandleFunc("", handlers.CreateEvent).Methods("POST")
	events.HandleFunc("/{id}", handlers.GetEvent).Methods("GET")
	events.HandleFunc("/{id}", handlers.UpdateEvent).Methods("PUT")
	events.HandleFunc("/{id}", handlers.DeleteEvent).Methods("DELETE")

	// Tasks routes - protected
	tasks := r.PathPrefix("/api/tasks").Subrouter()
	tasks.Use(middleware.AuthMiddleware)
	tasks.HandleFunc("", handlers.GetTasks).Methods("GET")
	tasks.HandleFunc("", handlers.CreateTask).Methods("POST")
	tasks.HandleFunc("/{id}", handlers.GetTask).Methods("GET")
	tasks.HandleFunc("/{id}", handlers.UpdateTask).Methods("PUT")
	tasks.HandleFunc("/{id}", handlers.DeleteTask).Methods("DELETE")
	tasks.HandleFunc("/clear-completed", handlers.DeleteCompletedTasks).Methods("DELETE")

	// Chats routes - protected
	chats := r.PathPrefix("/api/chats").Subrouter()
	chats.Use(middleware.AuthMiddleware)
	chats.HandleFunc("", handlers.GetChats).Methods("GET")
	chats.HandleFunc("", handlers.CreateChat).Methods("POST")
	chats.HandleFunc("/{id}", handlers.GetChat).Methods("GET")
	chats.HandleFunc("/{id}", handlers.UpdateChatTitle).Methods("PUT")
	chats.HandleFunc("/{id}", handlers.DeleteChat).Methods("DELETE")
	chats.HandleFunc("/{id}/messages", handlers.AddMessage).Methods("POST")

	// CORS middleware
	// r.Use(func(next http.Handler) http.Handler {
	// 	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
	// 		w.Header().Set("Access-Control-Allow-Origin", "*")
	// 		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
	// 		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

	// 		if r.Method == "OPTIONS" {
	// 			w.WriteHeader(http.StatusOK)
	// 			return
	// 		}

	// 		next.ServeHTTP(w, r)
	// 	})
	// })

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("Server running on port %s", port)
	log.Fatal(http.ListenAndServe(":"+port, r))
}
