package controller

import (
	"net/http"
	"github.com/gin-gonic/gin"
	"github.com/tanapon395/sa-67-example/config"
	"github.com/tanapon395/sa-67-example/entity"
	"time"
)


func GetAllWorkStatus(c *gin.Context) {

   db := config.DB()

   var workstatus []entity.WorkStatus

   db.Find(&workstatus)

   c.JSON(http.StatusOK, &workstatus)

}

func UpdateWorkStatus(c *gin.Context) {
	id := c.Param("id")
	var input entity.WorkStatus
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}	
	var workstatus entity.WorkStatus
	if err := config.DB().First(&workstatus, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "WorkStatus not found"})
		return
	}	
}

func UpdateWorkStatusAutomatically() {
	var works []entity.Work

	// ดึงงานที่ยังเปิดรับสมัคร (WorkStatusID = 1)
	if err := config.DB().Where("work_status_id = ?", 1).Find(&works).Error; err != nil {
		panic(err)
	}

	now := time.Now()

	for _, work := range works {
		if work.WorkTime.Before(now) {
			// อัปเดตสถานะเป็น Inactive (2)
			work.WorkStatusID = 2
			if err := config.DB().Save(&work).Error; err != nil {
				// log error
				println("Error updating work status:", err.Error())
			} else {
				println("Updated work ID", work.ID, "to Inactive")
			}
		}
	}
}