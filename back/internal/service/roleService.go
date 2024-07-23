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
func (rs *RoleService) CreateRole(name string) (*models.Role, error) {
	return rs.roleRepository.CreateRole(name)
}
