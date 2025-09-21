package controller

import (
	"net/http"
	"github.com/gin-gonic/gin"
	"github.com/tanapon395/sa-67-example/config"
	"github.com/tanapon395/sa-67-example/entity"
)

func GetBookingByUserID(c *gin.Context) {
	userID := c.Param("userID")
	var bookings []entity.Booking
	db := config.DB()

	// กรองเฉพาะ booking ที่ยังไม่ถูกลบ
	result := db.Where("user_id = ? AND deleted_at IS NULL", userID).Find(&bookings)
	if result.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": result.Error.Error()})
		return
	}		

	c.JSON(http.StatusOK, bookings)
}

func GetBookingByWorkID(c *gin.Context) {
	workID := c.Param("workID")
	var bookings []entity.Booking		
	db := config.DB()

	// กรองเฉพาะ booking ที่ยังไม่ถูกลบ
	result := db.Where("work_id = ? AND deleted_at IS NULL", workID).Find(&bookings)
	if result.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": result.Error.Error()})
		return
	}
	c.JSON(http.StatusOK, bookings)
}


func UpdateBooking(c *gin.Context) {
	id := c.Param("id")

	var input entity.BookingInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var booking entity.Booking
	if err := config.DB().First(&booking, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Booking not found"})
		return
	}

	// Update ทุก Field
	booking.UserID = input.UserID
	booking.WorkID = input.WorkID
	booking.Status = input.Status

	if err := config.DB().Save(&booking).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, booking)
}



func CreateBooking(c *gin.Context) {
	var input entity.BookingInput

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	booking := entity.Booking{
		UserID: input.UserID,
		WorkID: input.WorkID,
	}

	if err := config.DB().Create(&booking).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create booking"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Booking created", "booking": booking})
}


func DeleteBooking(c *gin.Context) {
	id := c.Param("id")
	db := config.DB()
	result := db.Delete(&entity.Booking{}, id)
	if result.Error != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to delete booking"})
		return
	}	
	c.JSON(http.StatusOK, gin.H{"message": "Booking deleted successfully"})
}

func GetAllBooking(c *gin.Context) {
	var bookings []entity.Booking
	db := config.DB()
	result := db.Preload("User").Preload("Work").Find(&bookings)
	if result.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": result.Error.Error()})
		return
	}	
	c.JSON(http.StatusOK, bookings)
}

// Add this function to list all bookings
func DeleteAllBookingByWorkID(c *gin.Context) {
	workID := c.Param("workID")
	db := config.DB()
	result := db.Where("work_id = ?", workID).Delete(&entity.Booking{})
	if result.Error != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to delete bookings"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Bookings deleted successfully"})
}

