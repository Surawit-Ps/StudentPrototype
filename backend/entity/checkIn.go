package entity

import (
	"gorm.io/gorm"
)
type CheckIn struct {
	gorm.Model
	UserID uint `json:"user_id"`
	WorkID uint `json:"work_id"`
	
	// ใช้ gorm:"-" เพื่อไม่ให้มัน bind ตอน POST payload
	User User `gorm:"foreignKey:UserID" json:"-"` 
	Work Work `gorm:"foreignKey:WorkID" json:"-"`
}

type CreateCheckInInput struct {
	UserID uint `json:"user_id" binding:"required"`
	WorkID uint `json:"work_id" binding:"required"`
}
