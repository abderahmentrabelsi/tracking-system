package repository

import (
	"back/internal/model"
	"back/internal/orm"
	"gorm.io/gorm"
)

type UserRepository struct{}

func NewUserRepository() *UserRepository {
	return &UserRepository{}
}

func (ur *UserRepository) GetUserByEmail(email string) (*models.User, error) {
	var user models.User
	if err := orm.DB.Where("email = ?", email).First(&user).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, nil
		}
		return nil, err
	}
	return &user, nil
}

func (ur *UserRepository) CreateUser(user *models.User) error {
	if err := orm.DB.Create(user).Error; err != nil {
		return err
	}
	return nil
}
