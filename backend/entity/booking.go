package entity

import (
	"gorm.io/gorm"
)

type Booking struct {
	gorm.Model

	UserID uint `json:"user_id"`
	User   User `gorm:"foreignKey:UserID"`

	WorkID uint `json:"work_id"`
	Work   Work `gorm:"foreignKey:WorkID"`

	Status string `json:"status" gorm:"default:'registered'"` // <-- NEW
}

// Struct สำหรับรับ JSON input จาก frontend
type BookingInput struct {
	UserID uint   `json:"user_id" binding:"required"`
	WorkID uint   `json:"work_id" binding:"required"`
	Status string `json:"status"  binding:"required"` // <-- Optional, default = "registered"
}
