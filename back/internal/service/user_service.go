package service

import (
	model "back/internal/model"
	"back/internal/orm"
	"back/internal/repository"
	"github.com/dgrijalva/jwt-go"
	"os"
	"strconv"
	"time"
)

type UserService struct {
	userRepository *repository.UserRepository
	roleRepository *repository.RoleRepository // Add this line
	fileService    *FileService               // Add this line
}

func NewUserService(userRepository *repository.UserRepository, roleRepository *repository.RoleRepository, fileService *FileService) *UserService {
	return &UserService{
		userRepository: userRepository,
		roleRepository: roleRepository, // Initialize roleRepository
		fileService:    fileService,    // Initialize fileService
	}
}

func (us *UserService) GetUserByEmail(email string) (*model.User, error) {
	return us.userRepository.GetUserByEmail(email)
}
func (us *UserService) CreateUser(user *model.User, files []model.FileUpload) error {
	err := us.userRepository.CreateUser(user)
	if err != nil {
		return err
	}

	// Assign UserID to each file and save them
	for i := range files {
		files[i].UserID = user.ID
		if err := us.fileService.SaveFile(&files[i]); err != nil {
			return err
		}
	}

	return nil
}
func (us *UserService) GetLoginHistory(userID uint) ([]model.LoginHistory, error) {
	return us.userRepository.GetLoginHistory(userID)
}
func (us *UserService) CreateLoginHistory(userID uint, clientIP string, userAgent string) error {
	history := model.LoginHistory{
		UserID:      userID,
		LoginIP:     clientIP,
		LoginDevice: userAgent,
		LoginTime:   time.Now(),
	}

	if err := orm.DB.Create(&history).Error; err != nil {
		return err
	}

	return nil
}
func (us *UserService) GenerateToken(email, username string, userID uint, role string, duration time.Duration) (string, error) {
	exp := time.Now().Add(duration)
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"UserID":   strconv.Itoa(int(userID)), // Convert userID to string
		"Email":    email,
		"Username": username, // Add the username to the token
		"Role":     role,
		"exp":      exp.Unix(),
	})
	return token.SignedString([]byte(os.Getenv("JWT_SECRET")))
}
func (us *UserService) GetRoleByID(roleID uint) (*model.Role, error) {
	return us.roleRepository.GetRoleByID(roleID)
}
func (us *UserService) GetUserByEmailOrUsername(identifier string) (*model.User, error) {
	return us.userRepository.GetUserByEmailOrUsername(identifier) // rename GetUserByEmail to GetUserByEmailOrUsername
}
func (us *UserService) GetUserByUsername(username string) (*model.User, error) {
	return us.userRepository.GetUserByUsername(username)
}
func (us *UserService) GetUserByID(id uint) (*model.User, error) {
	return us.userRepository.GetUserByID(id)
}
func (us *UserService) GetAllUsers() ([]*model.User, error) {
	return us.userRepository.GetAllUsers()
}
func (us *UserService) UpdateUserProfile(user *model.User) error {
	return us.userRepository.UpdateUser(user)
}
func (us *UserService) UpdatePassword(userID uint, newPassword string) error {
	return us.userRepository.UpdatePassword(userID, newPassword)
}
