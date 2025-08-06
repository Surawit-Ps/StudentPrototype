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
