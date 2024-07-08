package service

import (
	"back/internal/model"
	"back/internal/repository"
)

type DepartmentService struct {
	departmentRepo repository.DepartmentRepository
}

func NewDepartmentService(departmentRepo repository.DepartmentRepository) *DepartmentService {
	return &DepartmentService{
		departmentRepo: departmentRepo,
	}
}

func (s *DepartmentService) CreateClient(name string) (*models.Department, error) {
	return s.departmentRepo.CreateClient(name)
}
func (s *DepartmentService) CreateDepartment(name, clientName string, supervisorID uint) (*models.Department, error) {
	return s.departmentRepo.CreateDepartment(name, clientName, supervisorID)
}
func (s *DepartmentService) GetDepartmentByID(id uint) (*models.Department, error) {
	return s.departmentRepo.GetDepartmentByID(id)
}
func (s *DepartmentService) GetClientByID(id uint) (*models.Department, error) {
	return s.departmentRepo.GetClientByID(id)
}
func (s *DepartmentService) GetAllClients() ([]*models.Department, error) {
	return s.departmentRepo.GetAllClients()
}
func (s *DepartmentService) GetAllDepartmentsByClient(clientName string) ([]*models.Department, error) {
	return s.departmentRepo.GetAllDepartmentsByClient(clientName)
}
func (s *DepartmentService) UpdateDepartment(id uint, name string, supervisorID uint) error {
	return s.departmentRepo.UpdateDepartment(id, name, supervisorID)
}
func (s *DepartmentService) UpdateClient(id uint, name string) error {
	return s.departmentRepo.UpdateClient(id, name)
}
func (s *DepartmentService) DeleteDepartment(id uint) error {
	return s.departmentRepo.DeleteDepartment(id)
}
func (s *DepartmentService) DeleteClient(id uint) error {
	return s.departmentRepo.DeleteClient(id)
}

func (s *DepartmentService) GetDepartmentByIDd(id uint) (*models.Department, error) {
	return s.departmentRepo.GetDepartmentByIDd(id)
}

func (s *DepartmentService) GetUsersByDepartmentID(departmentID uint) ([]*models.User, error) {
	return s.departmentRepo.GetUsersByDepartmentID(departmentID)
}
