package controller

import (
	"time"
	"net/http"
	"github.com/gin-gonic/gin"
	"github.com/tanapon395/sa-67-example/config"
	"github.com/tanapon395/sa-67-example/entity"
)

func GetAllWork(c *gin.Context) {
	var work []entity.Work
	db := config.DB()

	result := db.Preload("WorkStatus").Preload("WorkType").Find(&work)

	if result.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": result.Error.Error()})
		return
	}

	c.JSON(http.StatusOK, work)
}

func GetWork(c *gin.Context) {
	ID := c.Param("id")
	var work entity.Work

	db := config.DB()

	result := db.Preload("WorkStatus").Preload("WorkType").First(&work, ID)

	if result.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": result.Error.Error()})
		return
	}

	c.JSON(http.StatusOK, work)
}

func CreateWork(c *gin.Context) {
	var work entity.Work

	// รับข้อมูล JSON ที่ส่งมาจาก client
	if err := c.ShouldBindJSON(&work); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Bad request, unable to map payload"})
		return
	}

	// บันทึกโปรโมชั่นใหม่ลงในฐานข้อมูล
	db := config.DB()
	if result := db.Create(&work); result.Error != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to create work"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Work created successfully", "work": work})
}

func UpdateWork(c *gin.Context) {
	var work entity.Work
	id := c.Param("id")

	db := config.DB()
	result := db.First(&work, id)

	if result.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "work not found"})
		return
	}

	if err := c.ShouldBindJSON(&work); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Bad request, unable to map payload"})
		return
	}
	if work.WorkTypeID == 1 && work.Paid == nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Paid is required for paid work"})
		return
	}
	if work.WorkTypeID == 2 && work.Volunteer == nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Volunteer is required for volunteer work"})
		return
	}

	result = db.Save(&work)

	if result.Error != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to update work"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Work updated successfully"})
}

func DeleteWork(c *gin.Context) {
	id := c.Param("id")
	db := config.DB()

	// ลบโปรโมชั่นจากฐานข้อมูล
	if tx := db.Exec("DELETE FROM works WHERE id = ?", id); tx.RowsAffected == 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Work not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Work deleted successfully"})
}

type RegisterPayload struct {
	UserID uint `json:"user_id"`
}

func RegisterWork(c *gin.Context) {
	id := c.Param("id") // รับ work id จาก URL
	db := config.DB()

	var work entity.Work
	if err := db.First(&work, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Work not found"})
		return
	}

	var payload RegisterPayload
	if err := c.ShouldBindJSON(&payload); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Missing or invalid user_id"})
		return
	}

	// ✅ ตรวจสอบว่าผู้ใช้เคยลงทะเบียนแล้วหรือยัง
	var user entity.User
	if err := db.First(&user, payload.UserID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}
	if user.Status == 1 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "User already registered for a job"})
		return
	}

	// ตรวจสอบว่าจำนวนคนเต็มหรือยัง
	if work.WorkUse >= work.WorkCount {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Work is full, cannot register"})
		return
	}

	// ตรวจสอบเวลา
	now := time.Now()
	if now.After(work.WorkTime) || now.Equal(work.WorkTime) {
		work.WorkStatusID = 2
		db.Save(&work)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Work is already started or passed"})
		return
	}

	// เพิ่มจำนวนผู้ใช้
	work.WorkUse += 1
	if err := db.Save(&work).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update work usage"})
		return
	}

	// เตรียม WorkHistory
	workHistory := entity.WorkHistory{
		UserID: payload.UserID,
		WorkID: work.ID,
	}
	if work.WorkTypeID == 1 && work.Paid != nil {
		workHistory.PaidAmount = work.Paid
	}
	if work.WorkTypeID == 2 && work.Volunteer != nil {
		workHistory.VolunteerHour = work.Volunteer
	}
	if err := db.Create(&workHistory).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to record work history"})
		return
	}

	// ✅ อัปเดตสถานะผู้ใช้เป็น 1
	user.Status = 1
	if err := db.Save(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update user status"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message":     "Registered successfully",
		"workuse":     work.WorkUse,
		"workhistory": workHistory,
	})
}

func GetWorkByPosterID(c *gin.Context) {
	posterID := c.Param("id")
	var works []entity.Work
	db := config.DB()
	result := db.Where("poster_id = ?", posterID).Find(&works)
	if result.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": result.Error.Error()})
		return
	}
	c.JSON(http.StatusOK, works)
}