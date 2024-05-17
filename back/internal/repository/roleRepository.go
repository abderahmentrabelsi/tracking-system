package repository

import (
	"back/internal/model"
	"back/internal/orm"
)

type RoleRepository struct{}

func NewRoleRepository() *RoleRepository {
	return &RoleRepository{}
}

func (rr *RoleRepository) GetRoleByID(roleID uint) (*models.Role, error) {
	var role models.Role
	if err := orm.DB.First(&role, roleID).Error; err != nil {
		return nil, err
	}
	return &role, nil
}

func (rr *RoleRepository) GetRoleByName(name string) (*models.Role, error) {
	var role models.Role
	if err := orm.DB.Where("name = ?", name).First(&role).Error; err != nil {
		return nil, err
	}
	return &role, nil
}
