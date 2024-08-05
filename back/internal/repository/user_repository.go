package repository

import (
	model "back/internal/model"
	"back/internal/orm"
	"fmt"
	"github.com/ipinfo/go/v2/ipinfo"
	"github.com/pquerna/otp/totp"
	"gorm.io/gorm"
	"log"
	"net"
	"os"
)

type UserRepository struct {
	ipinfoClient *ipinfo.Client
}

func NewUserRepository() *UserRepository {
	token := os.Getenv("IPINFO_TOKEN")
	if token == "" {
		log.Fatal("IPINFO_TOKEN environment variable is not set")
	}
	client := ipinfo.NewClient(nil, nil, token)
	return &UserRepository{ipinfoClient: client}
}

func (ur *UserRepository) GetUserByEmail(email string) (*model.User, error) {
	var user model.User
	if err := orm.DB.Where("email = ?", email).First(&user).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, nil
		}
		return nil, err
	}
	return &user, nil
}

func (ur *UserRepository) CreateUser(user *model.User) error {
	if err := orm.DB.Create(user).Error; err != nil {
		return err
	}
	return nil
}

func (ur *UserRepository) GetRoleByID(roleID uint) (*model.Role, error) {
	var role model.Role
	if err := orm.DB.First(&role, roleID).Error; err != nil {
		return nil, err
	}
	return &role, nil
}

func (ur *UserRepository) GetUserByEmailOrUsername(identifier string) (*model.User, error) {
	var user model.User
	if err := orm.DB.Where("email = ? OR username = ?", identifier, identifier).First(&user).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, nil
		}
		return nil, err
	}
	return &user, nil
}

func (ur *UserRepository) GetUserByUsername(username string) (*model.User, error) {
	var user model.User
	if err := orm.DB.Where("username = ?", username).First(&user).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, nil
		}
		return nil, err
	}
	return &user, nil
}

func (ur *UserRepository) GetUserByID(id uint) (*model.User, error) {
	var user model.User
	if err := orm.DB.Where("id = ?", id).First(&user).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, fmt.Errorf("user with ID %d not found", id)
		}
		return nil, fmt.Errorf("failed to retrieve user: %v", err)
	}
	return &user, nil
}

func (ur *UserRepository) GetAllUsers() ([]*model.User, error) {
	var users []*model.User
	if err := orm.DB.Preload("Department").Preload("Role").Find(&users).Error; err != nil {
		return nil, fmt.Errorf("failed to retrieve users: %v", err)
	}
	return users, nil
}

func (ur *UserRepository) UpdateUser(user *model.User) error {
	if err := orm.DB.Save(user).Error; err != nil {
		return fmt.Errorf("failed to update user: %v", err)
	}
	return nil
}

func (ur *UserRepository) UpdatePassword(userID uint, newPassword string) error {
	if err := orm.DB.Model(&model.User{}).Where("id = ?", userID).Update("password", newPassword).Error; err != nil {
		return fmt.Errorf("failed to update password for user ID %d: %v", userID, err)
	}
	return nil
}

func (ur *UserRepository) GetLoginHistory(userID uint) ([]model.LoginHistory, error) {
	var loginHistory []model.LoginHistory
	if err := orm.DB.Where("user_id = ?", userID).Find(&loginHistory).Error; err != nil {
		return nil, fmt.Errorf("failed to retrieve login history: %v", err)
	}

	ipLocationCache := make(map[string]string)

	for i, history := range loginHistory {
		if location, found := ipLocationCache[history.LoginIP]; found {
			loginHistory[i].Location = location
		} else {
			location, err := ur.getLocationFromIP(history.LoginIP)
			if err == nil {
				loginHistory[i].Location = location
				ipLocationCache[history.LoginIP] = location
			} else {
				loginHistory[i].Location = "Unknown"
			}
		}
	}

	return loginHistory, nil
}

func (ur *UserRepository) getLocationFromIP(ip string) (string, error) {
	if ip == "::1" || ip == "127.0.0.1" {
		return "Localhost", nil
	}

	info, err := ur.ipinfoClient.GetIPInfo(net.ParseIP(ip))
	if err != nil {
		fmt.Printf("Error fetching location for IP %s: %v\n", ip, err)
		return "", err
	}

	if info.City != "" && info.Region != "" {
		return fmt.Sprintf("%s, %s", info.City, info.Region), nil
	} else if info.City != "" {
		return info.City, nil
	} else if info.Region != "" {
		return info.Region, nil
	}

	return "Unknown", nil
}

func (ur *UserRepository) GenerateTOTPSecret(userID uint) (string, error) {
	var user model.User
	if err := orm.DB.Where("id = ?", userID).First(&user).Error; err != nil {
		return "", err
	}

	// Check if TOTPSecret already exists
	if user.TOTPSecret != "" {
		return user.TOTPSecret, nil
	}

	// Generate new TOTP key
	key, err := totp.Generate(totp.GenerateOpts{
		Issuer:      "YourAppName",
		AccountName: fmt.Sprintf("user-%d", userID),
	})
	if err != nil {
		return "", err
	}

	// Store the secret in the database
	if err := orm.DB.Model(&model.User{}).Where("id = ?", userID).Updates(map[string]interface{}{
		"TOTPSecret":  key.Secret(),
		"TOTPEnabled": true,
	}).Error; err != nil {
		return "", err
	}

	return key.Secret(), nil
}

func (ur *UserRepository) EnableTOTP(userID uint) error {
	return orm.DB.Model(&model.User{}).Where("id = ?", userID).Update("TOTPEnabled", true).Error
}

func (ur *UserRepository) VerifyTOTPCode(userID uint, code string) (bool, error) {
	var user model.User
	if err := orm.DB.Where("id = ?", userID).First(&user).Error; err != nil {
		return false, err
	}

	fmt.Printf("Verifying code: %s with secret: %s\n", code, user.TOTPSecret)

	valid := totp.Validate(code, user.TOTPSecret)
	return valid, nil
}

func (ur *UserRepository) DisableTOTP(userID uint) error {
	// Set TOTPEnabled to false, but keep the TOTPSecret
	if err := orm.DB.Model(&model.User{}).Where("id = ?", userID).Update("TOTPEnabled", false).Error; err != nil {
		return err
	}
	return nil
}

func (ur *UserRepository) IsTOTPEnabled(userID uint) (bool, error) {
	var user model.User
	if err := orm.DB.Select("TOTPEnabled").Where("id = ?", userID).First(&user).Error; err != nil {
		return false, err
	}
	return user.TOTPEnabled, nil
}
