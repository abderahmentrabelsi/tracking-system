package controller

import (
	models "back/internal/model"
	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
	"net/http"
)

func SignUp(c *gin.Context) {
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

	// Retrieve the department by ID
	department, err := models.GetDepartmentByID(body.DepartmentID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Department does not exist"})
		return
	}

	// Check if the role is valid
	if body.Role != string(models.Admin) && body.Role != string(models.Employee) {
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
		Role:        body.Role,
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
