package entity

import (
	"gorm.io/gorm"
)

type Review struct {
	gorm.Model

	UserID uint `json:"user_id"`
	User   User `gorm:"foreignKey:UserID"`

	WorkID uint `json:"work_id"`
	Work   Work `gorm:"foreignKey:WorkID"`

	BookingID uint `json:"booking_id"`
	Booking Booking `gorm:"foreignKey:BookingID"`

	// เนื้อหารีวิว
	Rating  int    `json:"rating"`
	Comment string `json:"comment"`
}
