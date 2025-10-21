package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Chat struct {
	ID        primitive.ObjectID `json:"_id,omitempty" bson:"_id,omitempty"`
	Title     string             `json:"title" bson:"title"`
	UserID    primitive.ObjectID `json:"userId" bson:"userId"`
	Messages  []Message          `json:"messages" bson:"messages"`
	CreatedAt time.Time          `json:"createdAt" bson:"createdAt"`
	UpdatedAt time.Time          `json:"updatedAt" bson:"updatedAt"`
}

type Message struct {
	ID        string    `json:"id" bson:"id"`
	Role      string    `json:"role" bson:"role"` // "user" or "assistant"
	Content   string    `json:"content" bson:"content"`
	Timestamp time.Time `json:"timestamp" bson:"timestamp"`
}

type CreateChatRequest struct {
	Title string `json:"title" binding:"required"`
}

type AddMessageRequest struct {
	ChatID  string  `json:"chatId" binding:"required"`
	Message Message `json:"message" binding:"required"`
}

type UpdateChatTitleRequest struct {
	Title string `json:"title" binding:"required"`
}
