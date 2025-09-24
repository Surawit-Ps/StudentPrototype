package main

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/tanapon395/sa-67-example/config"
	"github.com/tanapon395/sa-67-example/middlewares"
	"github.com/tanapon395/sa-67-example/controller"
	"github.com/tanapon395/sa-67-example/controller/user"
	"time"
	

)

const PORT = "8000"

func main() {

	// open connection database
	config.ConnectionDB()

	// Generate databases
	config.SetupDatabase()
	go func() {
		for {
			controller.UpdateWorkStatusAutomatically()
			time.Sleep(1 * time.Minute) // ตรวจสอบทุก 1 นาที
		}
	}()

	r := gin.Default()

	r.Use(CORSMiddleware())
	r.POST("/signup", user.SignUp) //สมัคร
	r.POST("/signin", user.SignIn) //Sign in == login
	r.GET("/genders", controller.ListGenders)
	r.POST("/users", controller.CreateUser)
	r.GET("/workhistories", controller.GetWorkHistories)

	router := r.Group("")
	
	{
		// User Routes
		router.Use(middlewares.Authorizes())
		router.GET("/users", controller.ListUsers)
		router.GET("/user/:id", controller.GetUser)
		router.PATCH("/users", controller.UpdateUser)
		router.DELETE("/users/:id", controller.DeleteUser)
		// Gender RoutesuserID

		router.POST("/work", controller.CreateWork)
		router.GET("/work", controller.GetAllWork)
		router.GET("/work/:id", controller.GetWork)
		router.PATCH("/work/:id", controller.UpdateWork)
		router.DELETE("/work/:id", controller.DeleteWork)
		router.POST("/work/register/:id", controller.RegisterWork)
		router.GET("/work/poster/:id", controller.GetWorkByPosterID)
		router.PATCH("/work/updateStatus/:id", controller.UpdateWorkStatus)
		
		router.POST("/dashboard", controller.CreateDashboard)
		router.GET("/dashboard", controller.GetAllDashboard)
		router.GET("/dashboard/:id", controller.GetDashboard)
		router.PATCH("/dashboard", controller.UpdateDashboard)
		router.DELETE("/dashboard/:id", controller.DeleteDashboard)

		// Booking Routes
		router.GET("/booking/user/:userID", controller.GetBookingByUserID)
		router.GET("/booking/work/:workID", controller.GetBookingByWorkID)
		router.POST("/booking", controller.CreateBooking)
		router.PATCH("/booking/:id", controller.UpdateBooking)
		router.DELETE("/booking/:id", controller.DeleteBooking)
		router.GET("/bookings", controller.GetAllBooking)
		router.DELETE("/bookings/work/:workID", controller.DeleteAllBookingByWorkID)
		// CheckIn Routes
		router.GET("/checkin/work/:workID", controller.GetcheckInByWorkID)
		router.POST("/checkin", controller.CreateCheckIn)
		router.PATCH("/checkin/:id", controller.UpdateCheckIn)
		router.DELETE("/checkin/:id", controller.DeleteCheckIn)
		router.GET("/checkins", controller.GetAllCheckIn)
		router.DELETE("/checkins/work/:workID", controller.DeleteAllCheckInByWorkID)

		// WorkHistory Routes
		router.GET("/workhistory/user/:userID", controller.GetWorkHistoryByUserID)
		router.GET("/workhistory/work/:workID", controller.GetWorkHistoryByWorkID)
		router.POST("/work/history", controller.CreateWorkHistory)

		//review
        router.POST("/review", controller.CreateReview)
        router.GET("/review", controller.GetAllReview)
        router.GET("/review/:id", controller.GetReview)
	}
	r.GET("/", func(c *gin.Context) {
		c.String(http.StatusOK, "API RUNNING... PORT: %s", PORT)
	})

	// Run the server

	r.Run("localhost:" + PORT)

}

func CORSMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT, DELETE, PATCH")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	}
}
