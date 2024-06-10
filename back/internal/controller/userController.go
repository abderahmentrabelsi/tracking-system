package controller

import (
	model "back/internal/model"
	"back/internal/service"
	"back/internal/store"
	"net/http"
	"os"
	"time"

	"github.com/dgrijalva/jwt-go"
	"github.com/gin-gonic/gin"
	"golang.org/x/crypto/bcrypt"
)

type UserController struct {
	userService       *service.UserService
	departmentService *service.DepartmentService
	roleService       *service.RoleService
}

func NewUserController(userService *service.UserService, departmentService *service.DepartmentService, roleService *service.RoleService) *UserController {
	return &UserController{
		userService:       userService,
		departmentService: departmentService,
		roleService:       roleService,
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
		Identifier  string `json:"Identifier"` // rename Email to Identifier
		Password    string `json:"Password"`
		RedirectURI string `json:"RedirectURI"` //  URI in login payload
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
	user, err := uc.userService.GetUserByEmailOrUsername(body.Identifier) // rename GetUserByEmail to GetUserByEmailOrUsername
	if err != nil || user == nil {
		c.JSON(http.StatusUnauthorized, gin.H{
			"data":   nil,
			"status": "error",
			"message": gin.H{
				"error": err.Error(),
				"msg":   "Invalid credentials",
			},
		})
		// Redirect to login page with original URI included
		c.Redirect(http.StatusTemporaryRedirect, "/login?uri="+body.RedirectURI)
		return
	}
	err = bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(body.Password))
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{
			"data":   nil,
			"status": "error",
			"message": gin.H{
				"error": err.Error(),
				"msg":   "Invalid credentials",
			},
		})
		// Redirect to login page with original URI included
		c.Redirect(http.StatusTemporaryRedirect, "/login?uri="+body.RedirectURI)
		return
	}

	roleEntity, err := uc.roleService.GetRoleByID(user.RoleID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"data":   nil,
			"status": "error",
			"message": gin.H{
				"error": err.Error(),
				"msg":   "Failed to fetch user role",
			},
		})
		return
	}

	accessToken, err := generateToken(user.Email, roleEntity.Name, 7*24*time.Hour)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"data":   nil,
			"status": "error",
			"message": gin.H{
				"error": err.Error(),
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
				"error": err.Error(),
				"msg":   "Failed to create login history",
			},
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data": gin.H{
			"access_token": accessToken,
			"redirect_uri": body.RedirectURI,
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

func generateToken(email string, role string, duration time.Duration) (string, error) {
	exp := time.Now().Add(duration)
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"UserID": email,
		"Role":   role,
		"exp":    exp.Unix(),
	})
	return token.SignedString([]byte(os.Getenv("JWT_SECRET")))
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
