package controller

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/tanapon395/sa-67-example/config"
	"github.com/tanapon395/sa-67-example/entity"
)

// GET /reviews
func GetAllReview(c *gin.Context) {
	var reviews []entity.Review
	db := config.DB()

	if err := db.Preload("User").Preload("Work").Preload("Booking").Find(&reviews).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, reviews)
}

// GET /reviews/:id
func GetReview(c *gin.Context) {
	id := c.Param("id")
	var review entity.Review

	db := config.DB()
	if err := db.Preload("User").Preload("Work").Preload("Booking").First(&review, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Review not found"})
		return
	}

	c.JSON(http.StatusOK, review)
}


func CreateReview(c *gin.Context) {
	var input struct {
		UserID    uint   `json:"user_id" binding:"required"`
		WorkID    uint   `json:"work_id" binding:"required"`
		BookingID uint   `json:"booking_id" binding:"required"`
		Rating    int    `json:"rating" binding:"required,min=1,max=5"`
		Comment   string `json:"comment" binding:"required"`
	}

	// ตรวจสอบ JSON และ required fields
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Bad request, missing or invalid fields"})
		return
	}

	db := config.DB()

	// ตรวจสอบว่าผู้ใช้มีอยู่จริง
	var user entity.User
	if err := db.First(&user, input.UserID).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "User not found"})
		return
	}

	// ตรวจสอบว่างาน (Work) มีอยู่จริง
	var work entity.Work
	if err := db.First(&work, input.WorkID).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Work not found"})
		return
	}

	// ตรวจสอบว่าการจอง (Booking) มีอยู่จริง
	var booking entity.Booking
	if err := db.First(&booking, input.BookingID).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Booking not found"})
		return
	}

	// สร้าง Review
	review := entity.Review{
		UserID:    input.UserID,
		WorkID:    input.WorkID,
		BookingID: input.BookingID,
		Rating:    input.Rating,
		Comment:   input.Comment,
	}

	if err := db.Create(&review).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to create review"})
		return
	}

	// --- อัปเดต TotalRating และ ReviewCount ---
	user.TotalRating = (user.TotalRating*float64(user.ReviewCount) + float64(input.Rating)) / float64(user.ReviewCount+1)
	user.ReviewCount += 1

	if err := db.Save(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update user rating"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "Review created successfully",
		"review":  review,
		"TotalRating": user.TotalRating,
		"ReviewCount": user.ReviewCount,
	})
}
