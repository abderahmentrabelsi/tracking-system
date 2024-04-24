package controller

import (
	models "back/internal/model"
	"back/internal/orm"
	"github.com/gin-gonic/gin"
	"github.com/pquerna/otp/totp"
	"github.com/skip2/go-qrcode"
	"golang.org/x/crypto/bcrypt"
	"net/http"
	"os"
	"path/filepath"
	"time"
)

func SignUp(c *gin.Context) {
	var body struct {
		FirstName    string `json:"FirstName"`
		LastName     string `json:"LastName"`
		PhoneNumber  string `json:"PhoneNumber"`
		Email        string `json:"Email"`
		DepartmentID uint   `json:"DepartmentID"`
	}

	if err := c.Bind(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}

	var existingUser models.User
	if err := orm.DB.Where("email = ?", body.Email).First(&existingUser).Error; err == nil {
		c.JSON(http.StatusConflict, gin.H{"error": "User already exists"})
		return
	}

	autoPassword := generateRandomPassword(12)
	hash, err := bcrypt.GenerateFromPassword([]byte(autoPassword), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error hashing password"})
		return
	}

	totpKey, err := totp.Generate(totp.GenerateOpts{
		Issuer:      "YourAppName",
		AccountName: body.Email,
	})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error generating TOTP secret"})
		return
	}

	user := models.User{
		FirstName:    body.FirstName,
		LastName:     body.LastName,
		PhoneNumber:  body.PhoneNumber,
		Email:        body.Email,
		DepartmentID: body.DepartmentID,
		Password:     string(hash),
		TokenDetails: models.TokenDetails{
			TOTPSecret: totpKey.Secret(),
		},
	}

	if err := orm.DB.Create(&user).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error creating user"})
		return
	}

	qrCodeDir := filepath.Join("static", "qrcodes")
	if _, err := os.Stat(qrCodeDir); os.IsNotExist(err) {
		os.MkdirAll(qrCodeDir, 0755)
	}
	qrCodeData := totpKey.URL()
	qrFilename := filepath.Join(qrCodeDir, body.Email+".png")
	qrCode, err := qrcode.Encode(qrCodeData, qrcode.Medium, 256)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate QR code"})
		return
	}

	err = os.WriteFile(qrFilename, qrCode, 0644)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save QR code"})
		return
	}

	qrURL := "/qrcodes/" + filepath.Base(qrFilename)
	c.JSON(http.StatusOK, gin.H{
		"email":         body.Email,
		"auto_password": autoPassword,
		"qrCodeURL":     qrURL,
		"message":       "User created successfully",
	})
}

// generateRandomPassword generates a random password of a specified length.
func generateRandomPassword(length int) string {
	const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
	b := make([]byte, length)
	for i := range b {
		b[i] = charset[time.Now().UnixNano()%int64(len(charset))]
	}
	return string(b)
}
