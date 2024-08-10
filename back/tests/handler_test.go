package tests

import (
	"back/internal/controller"
	model "back/internal/model"
	"back/internal/orm"
	"back/internal/repository"
	"back/internal/service"
	"encoding/json"
	"fmt"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	"github.com/stretchr/testify/assert"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
	"log"
	"net/http"
	"net/http/httptest"
	"os"
	"strings"
	"testing"
	"time"
)

var (
	userService    *service.UserService
	userController *controller.UserController
)

func disableForeignKeyChecks(db *gorm.DB) {
	db.Exec("SET FOREIGN_KEY_CHECKS = 0;")
}

func enableForeignKeyChecks(db *gorm.DB) {
	db.Exec("SET FOREIGN_KEY_CHECKS = 1;")
}

func initializeORM() {
	dsn := fmt.Sprintf("%s:%s@tcp(%s:%s)/%s?charset=utf8mb4&parseTime=True&loc=Local",
		os.Getenv("DB_USERNAME"), os.Getenv("DB_PASSWORD"), os.Getenv("DB_HOST"),
		os.Getenv("DB_PORT"), os.Getenv("DB_DATABASE"))
	db, err := gorm.Open(mysql.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatalf("Failed to initialize GORM: %v", err)
	}
	orm.DB = db
	err = db.AutoMigrate(&model.User{}, &model.Department{}, &model.LoginHistory{},
		&model.WorkHours{}, &model.Role{}, &model.Contract{}, &model.Salary{}, &model.FileUpload{},
		&model.Calendar{}, &model.CalendarEvent{}, &model.Task{}, &model.Comment{},
		&model.Project{}, &model.EducationDetail{}, &model.EmergencyContact{}, &model.LeaveRequest{})
	disableForeignKeyChecks(db)
	if err != nil {
		log.Fatalf("Failed to migrate database models: %v", err)
	}
	log.Println("Database connection established")
}

func setup() {
	err := godotenv.Load()
	if err != nil {
		log.Fatalf("Error loading .env file: %v", err)
	}
	initializeORM()

	// Initialize repositories
	userRepo := repository.NewUserRepository()
	departmentRepo := repository.NewDepartmentRepository()
	roleRepo := repository.NewRoleRepository()
	fileRepo := repository.NewFileRepository()

	// Initialize services
	fileService := service.NewFileService(fileRepo)
	departmentService := service.NewDepartmentService(departmentRepo)
	roleService := service.NewRoleService(roleRepo)
	userService = service.NewUserService(userRepo, roleRepo, fileService)
	workHoursRepo := repository.NewWorkHoursRepository()           // Add WorkHours repository
	workHoursService := service.NewWorkHoursService(workHoursRepo) // Add WorkHours service

	// Initialize controllers
	userController = controller.NewUserController(userService, departmentService, roleService, fileService)
	timesheetController = controller.NewTimesheetController(workHoursService) // Add Timesheet controller

	// Initialize FileService (if needed for tests)
	fileService = service.NewFileService(fileRepo)
}

func TestMain(m *testing.M) {
	setup()
	code := m.Run()
	enableForeignKeyChecks(orm.DB)
	os.Exit(code)
}

func TestCreateUser(t *testing.T) {
	user := &model.User{
		Email:    "test@example.com",
		Username: "testuser",
		Password: "securepassword",
	}

	err := userService.CreateUser(user, nil)
	assert.NoError(t, err)
	assert.NotZero(t, user.ID)

	// Cleanup
	orm.DB.Unscoped().Delete(&user)
}

func TestGetUserByEmail(t *testing.T) {
	user := &model.User{
		Email:    "testget@example.com",
		Username: "getuser",
		Password: "securepassword",
	}
	err := userService.CreateUser(user, nil)
	assert.NoError(t, err)

	fetchedUser, err := userService.GetUserByEmail(user.Email)
	assert.NoError(t, err)
	assert.Equal(t, user.Email, fetchedUser.Email)

	// Cleanup
	orm.DB.Unscoped().Delete(&user)
}

func TestUpdateUser(t *testing.T) {
	user := &model.User{
		Email:    "testupdate@example.com",
		Username: "updateuser",
		Password: "securepassword",
	}
	err := userService.CreateUser(user, nil)
	assert.NoError(t, err)

	user.Username = "updatedusername"
	err = userService.UpdateUser(user)
	assert.NoError(t, err)

	fetchedUser, err := userService.GetUserByEmail(user.Email)
	assert.NoError(t, err)
	assert.Equal(t, "updatedusername", fetchedUser.Username)

	// Cleanup
	orm.DB.Unscoped().Delete(&user)
}

func TestCreateLoginHistory(t *testing.T) {
	user := &model.User{
		Email:    "testloginhistory@example.com",
		Username: "loginhistoryuser",
		Password: "securepassword",
	}
	err := userService.CreateUser(user, nil)
	assert.NoError(t, err)

	err = userService.CreateLoginHistory(user.ID, "127.0.0.1", "test-agent")
	assert.NoError(t, err)

	histories, err := userService.GetLoginHistory(user.ID)
	assert.NoError(t, err)
	assert.Len(t, histories, 1)

	// Cleanup
	orm.DB.Unscoped().Delete(&histories[0])
	orm.DB.Unscoped().Delete(&user)
}

func TestGenerateToken(t *testing.T) {
	user := &model.User{
		Email:    "testtoken@example.com",
		Username: "tokenuser",
		Password: "securepassword",
	}
	err := userService.CreateUser(user, nil)
	assert.NoError(t, err)

	token, err := userService.GenerateToken(user.Email, user.Username, 1, user.ID, "user", time.Hour)
	assert.NoError(t, err)
	assert.NotEmpty(t, token)

	// Cleanup
	orm.DB.Unscoped().Delete(&user)
}

func TestTOTPWorkflow(t *testing.T) {
	user := &model.User{
		Email:    "testtotp@example.com",
		Username: "totpuser",
		Password: "securepassword",
	}
	err := userService.CreateUser(user, nil)
	assert.NoError(t, err)

	secret, err := userService.GenerateTOTPSecret(user.ID)
	assert.NoError(t, err)
	assert.NotEmpty(t, secret)

	err = userService.EnableTOTP(user.ID)
	assert.NoError(t, err)

	enabled, err := userService.IsTOTPEnabled(user.ID)
	assert.NoError(t, err)
	assert.True(t, enabled)

	valid, err := userService.VerifyTOTPCode(user.ID, "123456") // Replace with a valid TOTP code
	assert.NoError(t, err)
	assert.False(t, valid)

	err = userService.DisableTOTP(user.ID)
	assert.NoError(t, err)

	enabled, err = userService.IsTOTPEnabled(user.ID)
	assert.NoError(t, err)
	assert.False(t, enabled)

	// Cleanup
	orm.DB.Unscoped().Delete(&user)
}

func TestUpdatePassword(t *testing.T) {
	user := &model.User{
		Email:    "testupdatepassword@example.com",
		Username: "updatepassworduser",
		Password: "securepassword",
	}
	err := userService.CreateUser(user, nil)
	assert.NoError(t, err)

	newPassword := "newpassword"
	err = userService.UpdatePassword(user.ID, newPassword)
	assert.NoError(t, err)

	// Re-fetch the user and ensure the password has changed
	fetchedUser, err := userService.GetUserByID(user.ID)
	assert.NoError(t, err)
	assert.NotEqual(t, "securepassword", fetchedUser.Password) // Assuming password is hashed

	// Cleanup
	orm.DB.Unscoped().Delete(&user)
}

func createRequest(method, path string, body string) *http.Request {
	req := httptest.NewRequest(method, path, strings.NewReader(body))
	req.Header.Set("Content-Type", "application/json")
	return req
}

func TestSignUp(t *testing.T) {
	setup()

	// Clean up any existing user with the same email or username to avoid conflicts
	orm.DB.Unscoped().Where("email = ?", "john@example.com").Delete(&model.User{})
	orm.DB.Unscoped().Where("username = ?", "johndoe").Delete(&model.User{})

	// Ensure a department exists before testing
	department := &model.Department{
		Name: "Engineering",
	}
	err := orm.DB.Create(department).Error
	assert.NoError(t, err)

	// Ensure a role exists before testing
	role := &model.Role{
		Name: "User",
	}
	err = orm.DB.Create(role).Error
	assert.NoError(t, err)

	requestBody := fmt.Sprintf(`{
		"FirstName": "John",
		"LastName": "Doe",
		"PhoneNumber": "1234567890",
		"Email": "john@example.com",
		"Username": "johndoe",
		"DepartmentID": %d,
		"RoleName": "User",
		"JobTitle": "Developer"
	}`, department.ID)

	req := createRequest("POST", "/signup", requestBody)
	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)
	c.Request = req

	userController.SignUp(c)

	assert.Equal(t, http.StatusOK, w.Code)

	var response map[string]interface{}
	err = json.Unmarshal(w.Body.Bytes(), &response)
	assert.NoError(t, err)
	assert.Equal(t, "success", response["status"])

	// Cleanup
	orm.DB.Unscoped().Delete(&department)
	orm.DB.Unscoped().Delete(&role)
	orm.DB.Unscoped().Where("email = ?", "john@example.com").Delete(&model.User{})
	orm.DB.Unscoped().Where("username = ?", "johndoe").Delete(&model.User{})
}

func TestLoginHandler(t *testing.T) {
	setup()

	// Ensure a role exists before testing
	role := &model.Role{
		Name: "User",
	}
	err := orm.DB.Create(role).Error
	assert.NoError(t, err)

	// Create a user with that role to test login
	user := &model.User{
		Email:    "john@example.com",
		Username: "johndoe",
		Password: "securepassword",
		RoleID:   role.ID, // Assign the role ID
	}
	hash, _ := bcrypt.GenerateFromPassword([]byte(user.Password), bcrypt.DefaultCost)
	user.Password = string(hash)
	err = userService.CreateUser(user, nil)
	assert.NoError(t, err)

	// Test login with correct credentials
	requestBody := `{
		"Identifier": "john@example.com",
		"Password": "securepassword"
	}`

	req := createRequest("POST", "/login", requestBody)
	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)
	c.Request = req

	userController.LoginHandler(c)

	assert.Equal(t, http.StatusOK, w.Code)

	var response map[string]interface{}
	err = json.Unmarshal(w.Body.Bytes(), &response)
	assert.NoError(t, err)
	assert.Equal(t, "success", response["status"])

	// Cleanup
	orm.DB.Unscoped().Delete(&user)
	orm.DB.Unscoped().Delete(&role)
}

func TestLogoutHandler(t *testing.T) {
	setup()

	// Simulate a logged-in user by setting the "access_token" cookie
	req := createRequest("POST", "/logout", "")
	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)
	c.Request = req

	// Set a dummy token, assuming your middleware or logic checks for it
	c.Request.AddCookie(&http.Cookie{
		Name:     "access_token",
		Value:    "dummy_token",
		MaxAge:   3600,
		Path:     "/",
		HttpOnly: true,
	})

	userController.LogoutHandler(c)

	assert.Equal(t, http.StatusOK, w.Code)

	var response map[string]interface{}
	err := json.Unmarshal(w.Body.Bytes(), &response)
	assert.NoError(t, err)
	assert.Equal(t, "success", response["status"])
}

func TestGetUserByID(t *testing.T) {
	setup()

	req := createRequest("GET", "/user/1", "")
	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)
	c.Request = req
	c.Params = gin.Params{{Key: "id", Value: "1"}}

	userController.GetUserByID(c)

	assert.Equal(t, http.StatusOK, w.Code)

	var response map[string]interface{}
	err := json.Unmarshal(w.Body.Bytes(), &response)
	assert.NoError(t, err)
	assert.Equal(t, "success", response["status"])
}

func TestChangePassword(t *testing.T) {
	setup()

	// Create a user to test password change
	user := &model.User{
		Email:    "testuser@example.com",
		Username: "testuser",
		Password: "oldpassword",
	}
	hash, _ := bcrypt.GenerateFromPassword([]byte(user.Password), bcrypt.DefaultCost)
	user.Password = string(hash)
	err := userService.CreateUser(user, nil)
	assert.NoError(t, err)

	userID := fmt.Sprintf("%d", user.ID)
	requestBody := `{
		"currentPassword": "oldpassword",
		"newPassword": "newpassword"
	}`

	req := createRequest("POST", fmt.Sprintf("/user/%s/change-password", userID), requestBody)
	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)
	c.Request = req
	c.Set("userID", userID)

	userController.ChangePassword(c)

	assert.Equal(t, http.StatusOK, w.Code)

	var response map[string]interface{}
	err = json.Unmarshal(w.Body.Bytes(), &response)
	assert.NoError(t, err)
	assert.Equal(t, "Password updated successfully", response["message"])

	// Verify that the password was actually updated
	fetchedUser, err := userService.GetUserByID(user.ID)
	assert.NoError(t, err)
	assert.NoError(t, bcrypt.CompareHashAndPassword([]byte(fetchedUser.Password), []byte("newpassword")))

	// Cleanup
	orm.DB.Unscoped().Delete(&user)
}
