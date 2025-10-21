package models

import (
	"time"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type Event struct {
	ID        primitive.ObjectID `json:"_id,omitempty" bson:"_id,omitempty"`
	Title     string             `json:"title" bson:"title"`
	Day       string             `json:"day" bson:"day"`
	Time      string             `json:"time" bson:"time"`
	UserID    primitive.ObjectID `json:"userId" bson:"userId"`
	CreatedAt time.Time          `json:"createdAt" bson:"createdAt"`
	UpdatedAt time.Time          `json:"updatedAt" bson:"updatedAt"`
}

type CreateEventRequest struct {
	Title string `json:"title" binding:"required"`
	Day   string `json:"day" binding:"required"`
	Time  string `json:"time" binding:"required"`
}

type UpdateEventRequest struct {
	Title string `json:"title" binding:"required"`
	Day   string `json:"day" binding:"required"`
	Time  string `json:"time" binding:"required"`
}
