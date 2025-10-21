package database

import (
	"context"
	"log"
	"os"
	"time"

	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

var Client *mongo.Client
var UserCollection *mongo.Collection
var DBName string

func InitDB() {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	// Get MongoDB URI from environment
	mongoURI := os.Getenv("MONGODB_URI")
	if mongoURI == "" {
		mongoURI = "mongodb://localhost:27017"
	}

	// Get database name from environment
	DBName = os.Getenv("DATABASE_NAME")
	if DBName == "" {
		DBName = "yova"
	}

	clientOptions := options.Client().ApplyURI(mongoURI)
	client, err := mongo.Connect(ctx, clientOptions)
	if err != nil {
		log.Fatal("MongoDB connection error:", err)
	}

	err = client.Ping(ctx, nil)
	if err != nil {
		log.Fatal("MongoDB ping error:", err)
	}

	Client = client
	UserCollection = client.Database(DBName).Collection("users")
	log.Println("Connected to MongoDB successfully!")
}

// GetCollection returns a MongoDB collection by name
func GetCollection(collectionName string) *mongo.Collection {
	return Client.Database(DBName).Collection(collectionName)
}
