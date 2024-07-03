package repository

import (
	model "back/internal/model"
	"back/internal/orm"
	"fmt"
	"gorm.io/gorm"
)

type UserRepository struct{}

func NewUserRepository() *UserRepository {
	return &UserRepository{}
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
	if err := orm.DB.Find(&users).Error; err != nil {
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
