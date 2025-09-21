package controller
import (
	"net/http"
	"github.com/gin-gonic/gin"
	"github.com/tanapon395/sa-67-example/config"
	"github.com/tanapon395/sa-67-example/entity"
)
func GetcheckInByWorkID(c *gin.Context) {
	workID := c.Param("workID")
	var checkIns []entity.CheckIn
	db := config.DB()
	result := db.Where("work_id = ?", workID).Find(&checkIns)
	if result.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": result.Error.Error()})
		return
	}	
	c.JSON(http.StatusOK, checkIns)
}

func CreateCheckIn(c *gin.Context) {
	var input entity.CreateCheckInInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Bad request, unable to map payload"})
		return
	}

	checkIn := entity.CheckIn{
		UserID: input.UserID,
		WorkID: input.WorkID,
	}

	db := config.DB()
	if err := db.Create(&checkIn).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to create check-in"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message":     "Check-in and work history created successfully",
		"checkIn":     checkIn,
	})
}

func UpdateCheckIn(c *gin.Context) {
	id := c.Param("id")
	var checkIn entity.CheckIn	
	if err := c.ShouldBindJSON(&checkIn); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Bad request, unable to map payload"})
		return
	}
	db := config.DB()
	result := db.Model(&entity.CheckIn{}).Where("id = ?", id).Updates(checkIn)
	if result.Error != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to update check-in"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Check-in updated successfully", "checkIn": checkIn})
}

func DeleteCheckIn(c *gin.Context) {
	id := c.Param("id")
	db := config.DB()
	result := db.Delete(&entity.CheckIn{}, id)	
	if result.Error != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to delete check-in"})
		return
	}
	if result.RowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Check-in not found"})	
		return	
	}
	c.JSON(http.StatusOK, gin.H{"message": "Check-in deleted successfully"})
}	

func GetAllCheckIn (c *gin.Context) {
	var checkIns []entity.CheckIn
	db := config.DB()
	result := db.Find(&checkIns)
	if result.Error != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": result.Error.Error()})
		return
	}	
	c.JSON(http.StatusOK, checkIns)
}