package user

import (
	"errors"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"

	"github.com/tanapon395/sa-67-example/config"
	"github.com/tanapon395/sa-67-example/entity"
	"github.com/tanapon395/sa-67-example/services"
)

type (
	Authen struct {
		Email    string `json:"Email"`
		Password string `json:"Password"`
	}

	signUp struct {
		FirstName string    `json:"FirstName" binding:"required"`
		LastName  string    `json:"LastName" binding:"required"`
		Email     string    `json:"Email" binding:"required,email"`
		Password  string    `json:"Password" binding:"required"`
		BirthDay  time.Time `json:"BirthDay"`
		Profile   string    `json:"Profile" gorm:"type:longtext"`
		Role      string    `json:"Role"`
	}

	ResetPassword struct {
		Password string `json:"Password"`
		Email    string `json:"Email"`
	}
)

// ------------------------- Reset Password -------------------------
func ResetPasswordUser(c *gin.Context) {
	var payload ResetPassword
	if err := c.ShouldBindJSON(&payload); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var user entity.User
	db := config.DB()

	if err := db.Where("email = ?", payload.Email).First(&user).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		} else {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		}
		return
	}

	hashedPassword, err := config.HashPassword(payload.Password)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to hash password"})
		return
	}

	user.Password = hashedPassword
	if err := db.Save(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to update password"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Password reset successful"})
}

// ------------------------- Sign Up -------------------------
func SignUp(c *gin.Context) {
	var payload signUp
	if err := c.ShouldBindJSON(&payload); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	db := config.DB()

	// check email duplicate
	var userCheck entity.User
	if err := db.Where("email = ?", payload.Email).First(&userCheck).Error; err == nil {
		c.JSON(http.StatusConflict, gin.H{"error": "email is already registered"})
		return
	}

	hashedPassword, err := config.HashPassword(payload.Password)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Password hashing failed"})
		return
	}

	// ถ้า frontend ไม่ส่ง role มา ให้ default = user
	role := payload.Role
	if role == "" {
		role = "user"
	}

	user := entity.User{
		FirstName: payload.FirstName,
		LastName:  payload.LastName,
		BirthDay:  payload.BirthDay,
		Password:  hashedPassword,
		Email:     payload.Email,
		Profile:   payload.Profile,
		Role:      role,
	}

	if err := db.Create(&user).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "Sign-up successful", "user": user})
}

// ------------------------- Sign In -------------------------
func SignIn(c *gin.Context) {
	var payload Authen
	var user entity.User

	if err := c.ShouldBindJSON(&payload); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// หา user จาก email
	if err := config.DB().Where("email = ?", payload.Email).First(&user).Error; err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "email not found"})
		return
	}

	// ตรวจสอบ password
	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(payload.Password)); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "password is incorrect"})
		return
	}

	// generate JWT พร้อม role
	jwtWrapper := services.JwtWrapper{
		SecretKey:       "SvNQpBN8y3qlVrsGAYYWoJJk56LtzFHx",
		Issuer:          "AuthService",
		ExpirationHours: 24,
	}

	signedToken, err := jwtWrapper.GenerateToken(user.Email, user.Role)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "error signing token"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"token_type": "Bearer",
		"token":      signedToken,
		"id":         user.ID,
		"Role":       user.Role,
	})
}
