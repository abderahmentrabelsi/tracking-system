package service

import (
	"back/internal/model"
	"back/internal/orm"
	"back/internal/repository"
	"github.com/dgrijalva/jwt-go"
	"os"
	"time"
)

type UserService struct {
	userRepository *repository.UserRepository
	roleRepository *repository.RoleRepository // Add this line
}

func NewUserService(userRepository *repository.UserRepository, roleRepository *repository.RoleRepository) *UserService {
	return &UserService{
		userRepository: userRepository,
		roleRepository: roleRepository, // Initialize roleRepository
	}
}

func (us *UserService) GetUserByEmail(email string) (*models.User, error) {
	return us.userRepository.GetUserByEmail(email)
}

func (us *UserService) CreateUser(user *models.User) error {
	return us.userRepository.CreateUser(user)
}

func (us *UserService) CreateLoginHistory(userID uint, clientIP string, userAgent string) error {
	history := models.LoginHistory{
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

func (us *UserService) GenerateToken(email string, role string, duration time.Duration) (string, error) {
	exp := time.Now().Add(duration)
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"UserID": email,
		"Role":   role,
		"exp":    exp.Unix(),
	})
	return token.SignedString([]byte(os.Getenv("JWT_SECRET")))
}

func (us *UserService) GetRoleByID(roleID uint) (*models.Role, error) {
	return us.roleRepository.GetRoleByID(roleID)
}
