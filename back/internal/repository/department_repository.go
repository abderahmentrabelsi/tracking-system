package repository

import (
	"back/internal/model"
	"back/internal/orm"
	"fmt"
	"gorm.io/gorm"
)

type DepartmentRepository interface {
	CreateDepartment(name string, supervisorID uint) (*models.Department, error)
	GetDepartmentByID(id uint) (*models.Department, error)
	UpdateDepartment(id uint, name string, supervisorID uint) error
	DeleteDepartment(id uint) error
	GetAllDepartments() ([]*models.Department, error)
}

type DepartmentRepositoryImpl struct{}

func NewDepartmentRepository() DepartmentRepository {
	return &DepartmentRepositoryImpl{}
}

func (r *DepartmentRepositoryImpl) CreateDepartment(name string, supervisorID uint) (*models.Department, error) {
	department := &models.Department{
		Name:         name,
		SupervisorID: supervisorID,
	}
	if err := orm.DB.Create(department).Error; err != nil {
		return nil, fmt.Errorf("failed to create department: %v", err)
	}
	return department, nil
}

func (r *DepartmentRepositoryImpl) GetDepartmentByID(id uint) (*models.Department, error) {
	var department models.Department
	if err := orm.DB.First(&department, id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, fmt.Errorf("department with ID %d not found", id)
		}
		return nil, fmt.Errorf("failed to retrieve department: %v", err)
	}
	return &department, nil
}

func (r *DepartmentRepositoryImpl) UpdateDepartment(id uint, name string, supervisorID uint) error {
	department, err := r.GetDepartmentByID(id)
	if err != nil {
		return fmt.Errorf("failed to find department: %v", err)
	}
	fmt.Printf("Found department: %v\n", department) // Log department before updating

	department.Name = name
	department.SupervisorID = supervisorID

	if err := orm.DB.Save(department).Error; err != nil {
		return fmt.Errorf("failed to update department: %v", err)
	}
	fmt.Printf("Updated department: %v\n", department) // Log department after updating
	return nil
}

func (r *DepartmentRepositoryImpl) DeleteDepartment(id uint) error {
	if err := orm.DB.Delete(&models.Department{}, id).Error; err != nil {
		return fmt.Errorf("failed to delete department: %v", err)
	}
	return nil
}

func (r *DepartmentRepositoryImpl) GetAllDepartments() ([]*models.Department, error) {
	var departments []*models.Department
	if err := orm.DB.Find(&departments).Error; err != nil {
		return nil, fmt.Errorf("failed to retrieve departments: %v", err)
	}
	return departments, nil
}
