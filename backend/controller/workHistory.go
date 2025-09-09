package controller

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/tanapon395/sa-67-example/config"
	"github.com/tanapon395/sa-67-example/entity"
)

func GetWorkHistoryByUserID(c *gin.Context) {
	userID := c.Param("userID")
	var workHistories []entity.WorkHistory
	db := config.DB()
	result := db.Where("user_id = ?", userID).Find(&workHistories)
	if result.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": result.Error.Error()})
		return
	}
	c.JSON(http.StatusOK, workHistories)

}
func GetWorkHistoryByWorkID(c *gin.Context) {
	workID := c.Param("workID")
	var workHistories []entity.WorkHistory
	db := config.DB()
	result := db.Where("work_id = ?", workID).Find(&workHistories)
	if result.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": result.Error.Error()})
		return
	}

	c.JSON(http.StatusOK, workHistories)
	return
}

func CreateWorkHistory(c *gin.Context) {
	var input entity.CreateWorkHistoryInput

	// รับข้อมูล JSON และตรวจสอบ required fields
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Bad request, missing required fields"})
		return
	}

	// แปลงข้อมูลจาก input เป็น entity.WorkHistory
	workHistory := entity.WorkHistory{
		UserID:        input.UserID,
		WorkID:        input.WorkID,
		PaidAmount:    input.PaidAmount,
		VolunteerHour: input.VolunteerHour,
	}

	db := config.DB()
	if result := db.Create(&workHistory); result.Error != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to create work history"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Work history created successfully", "workHistory": workHistory})
}

func GetWorkHistories(c *gin.Context) {
	var histories []entity.WorkHistory
	userID := c.Query("userID") // ดึง user id จาก query string เช่น /work_histories?userID=1

	db := config.DB()
	if err := db.
		Preload("User").
		Preload("Work").
		Preload("Reviews").
		Where("user_id = ?", userID).
		Find(&histories).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, histories)
}
