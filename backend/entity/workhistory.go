package entity

import (

	"gorm.io/gorm"
)

type WorkHistory struct {
	gorm.Model

	UserID uint
	User   User `gorm:"foreignKey:UserID"`

	WorkID uint
	Work   Work `gorm:"foreignKey:WorkID"`

	PaidAmount     *int `json:"paid_amount"`      // nullable สำหรับกรณี volunteer
	VolunteerHour  *int `json:"volunteer_hour"`   // nullable สำหรับกรณี paid

	Reviews []Review `gorm:"foreignKey:WorkID;references:WorkID" json:"Reviews"`

}

type CreateWorkHistoryInput struct {
	UserID        uint `json:"user_id" binding:"required"`
	WorkID        uint `json:"work_id" binding:"required"`
	PaidAmount    *int `json:"paid_amount"`
	VolunteerHour *int `json:"volunteer_hour"`
}