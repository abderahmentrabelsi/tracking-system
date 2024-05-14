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

func (s *DepartmentService) CreateDepartment(name string, supervisorID uint) (*models.Department, error) {
	return s.departmentRepo.CreateDepartment(name, supervisorID)
}

func (s *DepartmentService) GetDepartmentByID(id uint) (*models.Department, error) {
	return s.departmentRepo.GetDepartmentByID(id)
}

func (s *DepartmentService) UpdateDepartment(id uint, name string, supervisorID uint) error {
	return s.departmentRepo.UpdateDepartment(id, name, supervisorID)
}

func (s *DepartmentService) DeleteDepartment(id uint) error {
	return s.departmentRepo.DeleteDepartment(id)
}
