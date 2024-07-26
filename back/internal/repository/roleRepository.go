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

func (rr *RoleRepository) GetAllRoles() ([]*models.Role, error) {
	var roles []*models.Role
	if err := orm.DB.Find(&roles).Error; err != nil {
		return nil, err
	}
	return roles, nil
}

func (rr *RoleRepository) CreateRole(name string) (*models.Role, error) {
	role := &models.Role{Name: name}
	if err := orm.DB.Create(role).Error; err != nil {
		return nil, err
	}
	return role, nil
}

// back/internal/repository/roleRepository.go
