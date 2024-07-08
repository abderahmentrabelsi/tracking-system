package controller

import (
	model "back/internal/model"
	"back/internal/service"
	"back/internal/store"
	"back/internal/utils"
	"fmt"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
)

type UserController struct {
	userService       *service.UserService
	departmentService *service.DepartmentService
	roleService       *service.RoleService
	fileService       *service.FileService // Add this line

}

func NewUserController(userService *service.UserService, departmentService *service.DepartmentService, roleService *service.RoleService, fileService *service.FileService) *UserController {
	return &UserController{
		userService:       userService,
		departmentService: departmentService,
		roleService:       roleService,
		fileService:       fileService,
	}
}

func (uc *UserController) SignUp(c *gin.Context) {
	var body struct {
		FirstName    string             `json:"FirstName"`
		LastName     string             `json:"LastName"`
		PhoneNumber  string             `json:"PhoneNumber"`
		Email        string             `json:"Email"`
		Username     string             `json:"Username"`
		DepartmentID uint               `json:"DepartmentID"`
		RoleName     string             `json:"RoleName"`
		Files        []model.FileUpload `json:"Files"`
		JobTitle     string             `json:"JobTitle"`
	}

	if err := c.Bind(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"data":   nil,
			"status": "error",
			"message": gin.H{
				"msg":   "Invalid request body",
				"error": err.Error(),
			},
		})
		return
	}

	existingUser, err := uc.userService.GetUserByEmail(body.Email)
	if err != nil || existingUser != nil {
		c.JSON(http.StatusConflict, gin.H{
			"data":   nil,
			"status": "error",
			"message": gin.H{
				"msg":   "Email already exists",
				"error": "Email already exists",
			},
		})
		return
	}

	existingUserByUsername, err := uc.userService.GetUserByUsername(body.Username)
	if err != nil || existingUserByUsername != nil {
		c.JSON(http.StatusConflict, gin.H{
			"data":   nil,
			"status": "error",
			"message": gin.H{
				"msg":   "Username already exists",
				"error": "Username already exists",
			},
		})
		return
	}

	department, err := uc.departmentService.GetDepartmentByID(body.DepartmentID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"data":   nil,
			"status": "error",
			"message": gin.H{
				"msg":   "Department does not exist",
				"error": err.Error(),
			},
		})
		return
	}

	roleEntity, err := uc.roleService.GetRoleByName(body.RoleName)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"data":   nil,
			"status": "error",
			"message": gin.H{
				"msg":   "Role does not exist",
				"error": err.Error(),
			},
		})
		return
	}

	defaultPassword := "defaultPassword"
	hash, err := bcrypt.GenerateFromPassword([]byte(defaultPassword), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"data":   nil,
			"status": "error",
			"message": gin.H{
				"msg":   "Error hashing password",
				"error": err.Error(),
			},
		})
		return
	}

	user := &model.User{
		FirstName:    body.FirstName,
		LastName:     body.LastName,
		PhoneNumber:  body.PhoneNumber,
		Email:        body.Email,
		Username:     body.Username,
		DepartmentID: department.ID,
		RoleID:       roleEntity.ID,
		Password:     string(hash),
		JobTitle:     body.JobTitle,
	}

	if err := uc.userService.CreateUser(user, body.Files); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"data":   nil,
			"status": "error",
			"message": gin.H{
				"msg":   "Error creating user",
				"error": err.Error(),
			},
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data":   gin.H{"user_id": user.ID, "email": body.Email, "default_password": defaultPassword, "username": body.Username},
		"status": "success",
		"message": gin.H{
			"msg": "User created successfully",
		},
	})
}
func (uc *UserController) LoginHandler(c *gin.Context) {
	var body struct {
		Identifier  string `json:"Identifier"`
		Password    string `json:"Password"`
		RedirectURI string `json:"RedirectURI"`
	}
	if err := c.Bind(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"data":   nil,
			"status": "error",
			"message": gin.H{
				"error": err.Error(),
				"msg":   "Invalid request body",
			},
		})
		return
	}

	clientIP := c.ClientIP()
	userAgent := c.GetHeader("User-Agent")
	user, err := uc.userService.GetUserByEmailOrUsername(body.Identifier)
	if err != nil || user == nil {
		c.JSON(http.StatusUnauthorized, gin.H{
			"data":   nil,
			"status": "error",
			"message": gin.H{
				"error": "User not found",
				"msg":   "Invalid credentials",
			},
		})
		c.Redirect(http.StatusTemporaryRedirect, "/login?uri="+body.RedirectURI)
		return
	}

	err = bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(body.Password))
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{
			"data":   nil,
			"status": "error",
			"message": gin.H{
				"error": "Password mismatch",
				"msg":   "Invalid credentials",
			},
		})
		c.Redirect(http.StatusTemporaryRedirect, "/login?uri="+body.RedirectURI)
		return
	}

	roleEntity, err := uc.roleService.GetRoleByID(user.RoleID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"data":   nil,
			"status": "error",
			"message": gin.H{
				"error": "Role retrieval error",
				"msg":   "Failed to fetch user role",
			},
		})
		return
	}

	accessToken, err := uc.userService.GenerateToken(user.Email, user.Username, user.ID, roleEntity.Name, 7*24*time.Hour)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"data":   nil,
			"status": "error",
			"message": gin.H{
				"error": "Token generation error",
				"msg":   "Failed to generate access token",
			},
		})
		return
	}

	c.SetCookie("access_token", accessToken, int(7*24*time.Hour.Seconds()), "/", "", false, true)

	err = uc.userService.CreateLoginHistory(user.ID, clientIP, userAgent)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"data":   nil,
			"status": "error",
			"message": gin.H{
				"error": "Login history error",
				"msg":   "Failed to create login history",
			},
		})
		return
	}

	redirectURI := body.RedirectURI
	if redirectURI == "" {
		redirectURI = "/home"
	}
	c.JSON(http.StatusOK, gin.H{
		"data": gin.H{
			"access_token": accessToken,
			"userRole":     roleEntity.Name,
			"redirect_uri": redirectURI,
		},
		"status": "success",
		"message": gin.H{
			"error": "",
			"msg":   "Login successful",
		},
	})
}
func (uc *UserController) LogoutHandler(c *gin.Context) {
	token, err := c.Cookie("access_token")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"data":   nil,
			"status": "error",
			"message": gin.H{
				"error": err.Error(),
				"msg":   "No access token provided",
			},
		})
		return
	}
	store.RevokeToken(token)
	c.SetCookie("access_token", "", -1, "/", "", false, true)
	c.JSON(http.StatusOK, gin.H{
		"data":   nil,
		"status": "success",
		"message": gin.H{
			"error": "",
			"msg":   "Logout successful",
		},
	})
}
func (uc *UserController) GetAllRoles(c *gin.Context) {
	roles, err := uc.roleService.GetAllRoles()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"data":   nil,
			"status": "error",
			"message": gin.H{
				"msg":   "Error fetching roles",
				"error": err.Error(),
			},
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data":   roles,
		"status": "success",
		"message": gin.H{
			"error": "",
			"msg":   "Roles retrieved successfully",
		},
	})
}
func (uc *UserController) GetUserByID(c *gin.Context) {
	userID, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"data":   nil,
			"status": "error",
			"message": gin.H{
				"error": err.Error(),
				"msg":   "Invalid USER ID",
			},
		})
		return
	}

	client, err := uc.userService.GetUserByID(uint(userID))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"data":   nil,
			"status": "error",
			"message": gin.H{
				"error": err.Error(),
				"msg":   "USER not found",
			},
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data":   client,
		"status": "success",
		"message": gin.H{
			"error": "",
			"msg":   "USER retrieved successfully",
		},
	})
}
func (uc *UserController) GetAllUsers(c *gin.Context) {
	users, err := uc.userService.GetAllUsers()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"data":   nil,
			"status": "error",
			"message": gin.H{
				"error": err.Error(),
				"msg":   "Failed to fetch users",
			},
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data":   users,
		"status": "success",
		"message": gin.H{
			"error": "",
			"msg":   "Users retrieved successfully",
		},
	})
}
func (uc *UserController) GetUserDetails(c *gin.Context) {
	userIDStr := c.GetString("userID")
	if userIDStr == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	userID, err := strconv.ParseUint(userIDStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
		return
	}

	user, err := uc.userService.GetUserByID(uint(userID))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Unable to fetch user"})
		return
	}

	department, err := uc.departmentService.GetDepartmentByIDd(user.DepartmentID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Unable to fetch department"})
		return
	}

	var clientName string
	var clientDepartments []*model.Department

	if department.ParentDepartmentID != nil {
		parentDepartment, err := uc.departmentService.GetDepartmentByIDd(*department.ParentDepartmentID)
		if err != nil {
			clientName = "Unknown"
		} else {
			clientName = parentDepartment.Name
			clientDepartments, err = uc.departmentService.GetAllDepartmentsByClient(parentDepartment.Name)
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Unable to fetch departments"})
				return
			}
		}
	} else {
		clientName = department.Name
		clientDepartments, err = uc.departmentService.GetAllDepartmentsByClient(department.Name)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Unable to fetch departments"})
			return
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"username":       user.Username,
		"email":          user.Email,
		"firstName":      user.FirstName,
		"lastName":       user.LastName,
		"picture":        user.Picture,
		"phoneNumber":    user.PhoneNumber,
		"address":        user.Address,
		"roleId":         user.RoleID,
		"departmentId":   user.DepartmentID,
		"createdAt":      user.CreatedAt.Format(time.RFC3339),
		"clientName":     clientName,
		"departmentName": department.Name,
		"departments":    clientDepartments,
		"jobTitle":       user.JobTitle,
	})
}
func (uc *UserController) GetUserDetailsByUsername(c *gin.Context) {
	username := c.Param("username")

	// Retrieve user details
	user, err := uc.userService.GetUserByUsername(username)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "User not found",
		})
		return
	}
	if user == nil {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "User not found",
		})
		return
	}

	// Retrieve department details
	department, err := uc.departmentService.GetDepartmentByIDd(user.DepartmentID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "Unable to fetch department",
		})
		return
	}

	// Retrieve client information based on department's parent
	var clientName string
	var clientDepartments []*model.Department

	if department.ParentDepartmentID != nil {
		parentDepartment, err := uc.departmentService.GetDepartmentByIDd(*department.ParentDepartmentID)
		if err != nil {
			clientName = "Unknown"
		} else {
			clientName = parentDepartment.Name
			clientDepartments, err = uc.departmentService.GetAllDepartmentsByClient(parentDepartment.Name)
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{
					"error": "Unable to fetch departments",
				})
				return
			}
		}
	} else {
		clientName = department.Name
		clientDepartments, err = uc.departmentService.GetAllDepartmentsByClient(department.Name)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": "Unable to fetch departments",
			})
			return
		}
	}

	// Construct the response
	response := gin.H{
		"username":       user.Username,
		"email":          user.Email,
		"firstName":      user.FirstName,
		"lastName":       user.LastName,
		"picture":        user.Picture,
		"phoneNumber":    user.PhoneNumber,
		"address":        user.Address,
		"roleId":         user.RoleID,
		"departmentId":   user.DepartmentID,
		"createdAt":      user.CreatedAt.Format(time.RFC3339),
		"clientName":     clientName,
		"departmentName": department.Name,
		"departments":    clientDepartments,
		"jobTitle":       user.JobTitle,
	}

	c.JSON(http.StatusOK, response)
}
func (uc *UserController) UpdateUserProfile(c *gin.Context) {
	username := c.Param("username")
	loggedInUsername := c.GetString("username")

	if loggedInUsername != username {
		c.JSON(http.StatusForbidden, gin.H{"error": "You can only update your own profile"})
		return
	}

	userIDStr := c.GetString("userID")
	userID, err := strconv.ParseUint(userIDStr, 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
		return
	}

	user, err := uc.userService.GetUserByID(uint(userID))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	var body struct {
		FirstName   string `json:"firstName"`
		LastName    string `json:"lastName"`
		Email       string `json:"email"`
		PhoneNumber string `json:"phoneNumber"`
		Address     string `json:"address"`
		Picture     string `json:"picture"` // Add this line
	}

	if err := c.BindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}

	user.FirstName = body.FirstName
	user.LastName = body.LastName
	user.Email = body.Email
	user.PhoneNumber = body.PhoneNumber
	user.Address = body.Address
	user.Picture = body.Picture // Ensure this line is present

	if err := uc.userService.UpdateUserProfile(user); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Unable to update user profile"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Profile updated successfully"})
}
func (uc *UserController) ChangePassword(c *gin.Context) {
	var body struct {
		CurrentPassword string `json:"currentPassword"`
		NewPassword     string `json:"newPassword"`
	}

	if err := c.Bind(&body); err != nil {
		fmt.Println("Error binding request body:", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}

	userIDStr := c.GetString("userID")
	userID, err := strconv.ParseUint(userIDStr, 10, 32)
	if err != nil {
		fmt.Println("Error parsing user ID:", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid user ID"})
		return
	}

	fmt.Println("User ID:", userID)

	user, err := uc.userService.GetUserByID(uint(userID))
	if err != nil {
		fmt.Println("Error fetching user:", err)
		c.JSON(http.StatusNotFound, gin.H{"error": "User not found"})
		return
	}

	fmt.Println("User found:", user)

	err = bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(body.CurrentPassword))
	if err != nil {
		fmt.Println("Current password mismatch:", err)
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Current password is incorrect"})
		return
	}

	if !utils.ValidatePassword(body.NewPassword) {
		fmt.Println("New password does not meet criteria")
		c.JSON(http.StatusBadRequest, gin.H{"error": "New password does not meet the criteria"})
		return
	}

	hash, err := bcrypt.GenerateFromPassword([]byte(body.NewPassword), bcrypt.DefaultCost)
	if err != nil {
		fmt.Println("Error hashing new password:", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error hashing new password"})
		return
	}

	err = uc.userService.UpdatePassword(uint(userID), string(hash))
	if err != nil {
		fmt.Println("Error updating password:", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Unable to update password"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Password updated successfully"})
}
