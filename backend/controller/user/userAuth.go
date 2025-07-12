package user

import (
	"errors"

	"net/http"

	"github.com/gin-gonic/gin"

	"golang.org/x/crypto/bcrypt"

	"gorm.io/gorm"

	"github.com/tanapon395/sa-67-example/config"

	"github.com/tanapon395/sa-67-example/entity"

	"github.com/tanapon395/sa-67-example/services"
	"time"
)

type (
	Authen struct {
		Email string `json:"Email"`
		Password string `json:"Password"`
	}

	signUp struct {
		FirstName string    `json:"FirstName" binding:"required"`
		LastName  string    `json:"LastName" binding:"required"`
		Email     string    `json:"Email" binding:"required,email"`
		Password  string    `json:"Password" binding:"required"`
		BirthDay  time.Time `json:"BirthDay"`
		Profile   string    `json:"Profile" gorm:"type:longtext"`
		Role 	string    `json:"Role" gorm:"default:'user'"`

	}

	ResetPassword struct {
		Password string `json:"Password"`
		Email    string `json:"Email"`
	}
)

func ResetPasswordUser(c *gin.Context) {
	var payload ResetPassword

	// Bind JSON payload to the struct
	if err := c.ShouldBindJSON(&payload); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var user entity.User
	db := config.DB()

	// ค้นหาผู้ใช้ด้วย Username และ Email ที่ผู้ใช้กรอกเข้ามา
	result := db.Where("email = ?", payload.Email).First(&user)
	if result.Error != nil {
		if errors.Is(result.Error, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": result.Error.Error()})
		}
		return
	}

	// แฮชรหัสผ่านใหม่
	hashedPassword, err := config.HashPassword(payload.Password)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to hash password"})
		return
	}

	// อัปเดตรหัสผ่านในฐานข้อมูล
	user.Password = hashedPassword
	if err := db.Save(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update password"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Password reset successful"})
}

func SignUp(c *gin.Context) {
	var payload struct {
		FirstName string    `json:"FirstName" binding:"required"`
		LastName  string    `json:"LastName" binding:"required"`
		Email     string    `json:"Email" binding:"required,email"`
		Password  string    `json:"Password" binding:"required"`
		BirthDay  time.Time `json:"BirthDay"`
		Profile   string    `json:"Profile" gorm:"type:longtext"`
		Role 	string    `json:"Role" gorm:"default:'user'"`
	}

	// Bind JSON payload to the struct
	if err := c.ShouldBindJSON(&payload); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	db := config.DB()

	// Check if the Email already exists
	var userCheck entity.User
	result := db.Where("email = ?", payload.Email).First(&userCheck)
	if result.Error != nil && !errors.Is(result.Error, gorm.ErrRecordNotFound) {
		c.JSON(http.StatusInternalServerError, gin.H{"error": result.Error.Error()})
		return
	}

	if userCheck.ID != 0 {
		c.JSON(http.StatusConflict, gin.H{"error": "email is already registered"})
		return
	}

	// Hash the user's password
	hashedPassword, err := config.HashPassword(payload.Password)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Password hashing failed"})
		return
	}

	// Create a new user
	user := entity.User{
		FirstName:         payload.FirstName,
		LastName:          payload.LastName,
		BirthDay:          payload.BirthDay,
		Password:          hashedPassword,
		Email:             payload.Email,
		Profile:           payload.Profile,
		Role:              "user",
	}

	// Save the user to the database
	if err := db.Create(&user).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "Sign-up successful", "user": user})
}

// Sign in == login
func SignIn(c *gin.Context) {

	var payload Authen

	var user entity.User

	if err := c.ShouldBindJSON(&payload); err != nil {

		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})

		return

	}

	// ค้นหา user ด้วย Username ที่ผู้ใช้กรอกเข้ามา

	if err := config.DB().Raw("SELECT * FROM users WHERE email = ?", payload.Email).Scan(&user).Error; err != nil {

		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})

		return

	}

	// ตรวจสอบรหัสผ่าน

	err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(payload.Password))

	if err != nil {

		c.JSON(http.StatusBadRequest, gin.H{"error": "password is incerrect"})

		return

	}

	jwtWrapper := services.JwtWrapper{

		SecretKey: "SvNQpBN8y3qlVrsGAYYWoJJk56LtzFHx",

		Issuer: "AuthService",

		ExpirationHours: 24,
	}

	signedToken, err := jwtWrapper.GenerateToken(user.Email)

	if err != nil {

		c.JSON(http.StatusBadRequest, gin.H{"error": "error signing token"})

		return

	}

	c.JSON(http.StatusOK, gin.H{"token_type": "Bearer", "token": signedToken, "id": user.ID})

}
