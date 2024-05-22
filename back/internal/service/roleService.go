package service

import (
	"back/internal/model"
	"back/internal/repository"
)

type RoleService struct {
	roleRepository *repository.RoleRepository
}

func NewRoleService(roleRepository *repository.RoleRepository) *RoleService {
	return &RoleService{
		roleRepository: roleRepository,
	}
}

func (rs *RoleService) GetRoleByID(roleID uint) (*models.Role, error) {
	return rs.roleRepository.GetRoleByID(roleID)
}

func (rs *RoleService) GetRoleByName(name string) (*models.Role, error) {
	return rs.roleRepository.GetRoleByName(name)
}

func (rs *RoleService) GetAllRoles() ([]*models.Role, error) {
	return rs.roleRepository.GetAllRoles()
}

// back/internal/service/roleService.go

func (rs *RoleService) CreateRole(name string) (*models.Role, error) {
	return rs.roleRepository.CreateRole(name)
}

func (rs *RoleService) CreatePermission(name string, description string) (*models.Permission, error) {
	return rs.roleRepository.CreatePermission(name, description)
}

func (rs *RoleService) CreateRolePermission(roleID uint, permissionID uint) (*models.RolePermission, error) {
	return rs.roleRepository.CreateRolePermission(roleID, permissionID)
}
