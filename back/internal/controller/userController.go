package controller

import (
	"back/internal/middleware"
	models "back/internal/model"
	"back/internal/store"
	"github.com/dgrijalva/jwt-go"
	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
	"net/http"
	"os"
	"time"
)

func SignUp(c *gin.Context) {
	// Authenticate the request and check the role
	middleware.AuthMiddleware()(c)
	role, exists := c.Get("userRole")
	if !exists || role != string(models.Admin) {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	var body struct {
		FirstName    string `json:"FirstName"`
		LastName     string `json:"LastName"`
		PhoneNumber  string `json:"PhoneNumber"`
		Email        string `json:"Email"`
		DepartmentID uint   `json:"DepartmentID"`
		Role         string `json:"Role"`
	}
	if err := c.Bind(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}
	existingUser, err := models.GetUserByEmail(body.Email)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error checking user existence"})
		return
	}
	if existingUser != nil {
		c.JSON(http.StatusConflict, gin.H{"error": "User already exists"})
		return
	}
	department, err := models.GetDepartmentByID(body.DepartmentID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Department does not exist"})
		return
	}
	userRole := models.Role(body.Role)
	if userRole != models.Admin && userRole != models.Employee {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid role"})
		return
	}
	defaultPassword := "defaultPassword"
	hash, err := bcrypt.GenerateFromPassword([]byte(defaultPassword), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error hashing password"})
		return
	}
	user := models.User{
		FirstName:   body.FirstName,
		LastName:    body.LastName,
		PhoneNumber: body.PhoneNumber,
		Email:       body.Email,
		Department:  *department,
		Role:        userRole,
		Password:    string(hash),
	}
	if err := models.CreateUser(&user); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error creating user"})
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"email":            body.Email,
		"default_password": defaultPassword,
		"message":          "User created successfully",
	})
}
func LoginHandler(c *gin.Context) {
	var body struct {
		Email    string `json:"Email"`
		Password string `json:"Password"`
	}
	if err := c.Bind(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}
	clientIP := c.ClientIP()
	userAgent := c.GetHeader("User-Agent")
	user, err := models.GetUserByEmail(body.Email)
	if err != nil || user == nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
		return
	}
	err = bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(body.Password))
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
		return
	}
	accessToken, err := generateToken(user.Email, string(user.Role), 7*24*time.Hour)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate access token"})
		return
	}
	// c.SetCookie("access_token", accessToken, int(7*24*time.Hour.Seconds()), "/", "", false, true) // Comment this line
	err = user.CreateLoginHistory(clientIP, userAgent)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create login history"})
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"message": "Login successful",
		"access_token": accessToken, // Add this line
	})
}
func LogoutHandler(c *gin.Context) {
	token, err := c.Cookie("access_token")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "No access token provided"})
		return
	}
	store.RevokeToken(token) // Add this line to blacklist the token
	c.SetCookie("access_token", "", -1, "/", "", false, true)
	c.JSON(http.StatusOK, gin.H{
		"message": "Logout successful",
	})
}
func generateToken(email string, role string, duration time.Duration) (string, error) {
	exp := time.Now().Add(duration)
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"UserID": email,
		"Role":   role,
		"exp":    exp.Unix(),
	})
	return token.SignedString([]byte(os.Getenv("JWT_SECRET")))
}
