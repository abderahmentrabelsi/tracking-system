package repository

import (
	models "back/internal/model"
	"back/internal/orm"
	"fmt"

	"gorm.io/gorm"
)

type DepartmentRepository interface {
	CreateClient(name string) (*models.Department, error)
	CreateDepartment(name, clientName string, supervisorID uint) (*models.Department, error)
	GetAllClients() ([]*models.Department, error)
	GetAllDepartmentsByClient(clientName string) ([]*models.Department, error)
	GetDepartmentByID(id uint) (*models.Department, error)
	GetClientByID(id uint) (*models.Department, error)
	UpdateDepartment(id uint, name string, supervisorID uint) error
	UpdateClient(id uint, name string) error
	DeleteDepartment(id uint) error
	DeleteClient(id uint) error
	GetDepartmentByIDd(id uint) (*models.Department, error)
	GetUsersByDepartmentID(departmentID uint) ([]*models.User, error)
	GetSupervisorByDepartmentID(departmentID uint) (*models.User, error)
}
type DepartmentRepositoryImpl struct{}

func NewDepartmentRepository() DepartmentRepository {
	return &DepartmentRepositoryImpl{}
}

func (r *DepartmentRepositoryImpl) GetSupervisorByDepartmentID(departmentID uint) (*models.User, error) {
	var department models.Department
	if err := orm.DB.Preload("Supervisor").Where("id = ?", departmentID).First(&department).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, fmt.Errorf("department with ID %d not found", departmentID)
		}
		return nil, fmt.Errorf("failed to retrieve department: %v", err)
	}
	if department.Supervisor == nil {
		return nil, fmt.Errorf("no supervisor assigned to department with ID %d", departmentID)
	}
	return department.Supervisor, nil
}
func (r *DepartmentRepositoryImpl) CreateClient(name string) (*models.Department, error) {
	client := &models.Department{
		Name:               name,
		ParentDepartmentID: nil,
	}
	if err := orm.DB.Create(client).Error; err != nil {
		return nil, fmt.Errorf("failed to create client: %v", err)
	}
	return client, nil
}
func (r *DepartmentRepositoryImpl) CreateDepartment(name, clientName string, supervisorID uint) (*models.Department, error) {
	var client models.Department
	if err := orm.DB.Where("name = ?", clientName).First(&client).Error; err != nil {
		return nil, fmt.Errorf("client with name %s not found", clientName)
	}

	department := &models.Department{
		Name:               name,
		SupervisorID:       &supervisorID,
		ParentDepartmentID: &client.ID,
	}

	if err := orm.DB.Create(department).Error; err != nil {
		return nil, fmt.Errorf("failed to create department: %v", err)
	}
	return department, nil
}
func (r *DepartmentRepositoryImpl) GetAllClients() ([]*models.Department, error) {
	var clients []*models.Department
	if err := orm.DB.Where("parent_department_id IS NULL").Find(&clients).Error; err != nil {
		return nil, fmt.Errorf("failed to retrieve clients: %v", err)
	}
	return clients, nil
}
func (r *DepartmentRepositoryImpl) GetAllDepartmentsByClient(clientName string) ([]*models.Department, error) {
	var client models.Department
	if err := orm.DB.Where("name = ?", clientName).First(&client).Error; err != nil {
		return nil, fmt.Errorf("client with name %s not found", clientName)
	}

	var departments []*models.Department
	if err := orm.DB.Where("parent_department_id = ?", client.ID).Find(&departments).Error; err != nil {
		return nil, fmt.Errorf("failed to retrieve departments: %v", err)
	}
	return departments, nil
}

func (r *DepartmentRepositoryImpl) GetDepartmentByID(id uint) (*models.Department, error) {
	var department models.Department
	if err := orm.DB.Preload("ParentDepartment").Preload("Calendar").Preload("Users").Where("id = ?", id).First(&department).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, fmt.Errorf("department with ID %d not found", id)
		}
		return nil, fmt.Errorf("failed to retrieve department: %v", err)
	}
	return &department, nil
}

func (r *DepartmentRepositoryImpl) GetClientByID(id uint) (*models.Department, error) {
	var client models.Department
	if err := orm.DB.Where("id = ? AND parent_department_id IS NULL", id).First(&client).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, fmt.Errorf("client with ID %d not found", id)
		}
		return nil, fmt.Errorf("failed to retrieve client: %v", err)
	}
	return &client, nil
}
func (r *DepartmentRepositoryImpl) UpdateDepartment(id uint, name string, supervisorID uint) error {
	department, err := r.GetDepartmentByID(id)
	if err != nil {
		return fmt.Errorf("failed to find department: %v", err)
	}

	department.Name = name
	department.SupervisorID = &supervisorID

	if err := orm.DB.Save(department).Error; err != nil {
		return fmt.Errorf("failed to update department: %v", err)
	}
	return nil
}
func (r *DepartmentRepositoryImpl) UpdateClient(id uint, name string) error {
	client, err := r.GetClientByID(id)
	if err != nil {
		return fmt.Errorf("failed to find client: %v", err)
	}
	client.Name = name

	if err := orm.DB.Save(client).Error; err != nil {
		return fmt.Errorf("failed to update client: %v", err)
	}
	return nil
}
func (r *DepartmentRepositoryImpl) DeleteDepartment(id uint) error {
	if err := orm.DB.Delete(&models.Department{}, id).Error; err != nil {
		return fmt.Errorf("failed to delete department: %v", err)
	}
	return nil
}
func (r *DepartmentRepositoryImpl) DeleteClient(id uint) error {
	if err := orm.DB.Where("parent_department_id = ?", id).Delete(&models.Department{}).Error; err != nil {
		return fmt.Errorf("failed to delete departments under client: %v", err)
	}
	if err := orm.DB.Delete(&models.Department{}, id).Error; err != nil {
		return fmt.Errorf("failed to delete client: %v", err)
	}
	return nil
}

func (r *DepartmentRepositoryImpl) GetDepartmentByIDd(id uint) (*models.Department, error) {
	var department models.Department
	if err := orm.DB.Preload("ParentDepartment").Where("id = ?", id).First(&department).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, fmt.Errorf("department with ID %d not found", id)
		}
		return nil, fmt.Errorf("failed to retrieve department: %v", err)
	}
	return &department, nil
}

func (r *DepartmentRepositoryImpl) GetUsersByDepartmentID(departmentID uint) ([]*models.User, error) {
	var users []*models.User
	if err := orm.DB.Where("department_id = ?", departmentID).Find(&users).Error; err != nil {
		return nil, fmt.Errorf("failed to retrieve users: %v", err)
	}
	return users, nil
}
