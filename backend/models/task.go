package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Task struct {
	ID          primitive.ObjectID `json:"_id,omitempty" bson:"_id,omitempty"`
	Title       string             `json:"title" bson:"title"`
	IsCompleted bool               `json:"is_completed" bson:"is_completed"`
	UserID      primitive.ObjectID `json:"userId" bson:"userId"`
	CreatedAt   time.Time          `json:"createdAt" bson:"createdAt"`
	UpdatedAt   time.Time          `json:"updatedAt" bson:"updatedAt"`
}

type CreateTaskRequest struct {
	Title string `json:"title" binding:"required"`
}

type UpdateTaskRequest struct {
	Title       string `json:"title" binding:"required"`
	IsCompleted bool   `json:"is_completed"`
}
