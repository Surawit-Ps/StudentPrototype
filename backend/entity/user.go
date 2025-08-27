package entity

import (
	"time"

	"gorm.io/gorm"
)

type User struct {
	gorm.Model
	FirstName string    `json:"FirstName" binding:"required"`
	LastName  string    `json:"LastName" binding:"required"`
	Email     string    `json:"Email" binding:"required,email"`
	Password  string    `json:"Password" binding:"required"`
	BirthDay  time.Time `json:"BirthDay"`
	Profile   string    `json:"Profile" gorm:"type:longtext"`
	Role      string    `json:"Role"`

	// GenderID ทำหน้าที่เป็น FK
	GenderID uint
	Gender   Gender `gorm:"foriegnKey:GenderID"`

	WorkHistories []WorkHistory `gorm:"foreignKey:UserID"`
	Status int `json:"status" gorm:"default:0"`
}
