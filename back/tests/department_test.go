package tests

import (
	model "back/internal/model"
	"back/internal/orm"
	"back/internal/repository"
	"back/internal/service"
	"github.com/stretchr/testify/assert"
	"testing"
)

var departmentService *service.DepartmentService

func setupDepartmentService() {
	departmentRepo := repository.NewDepartmentRepository()
	departmentService = service.NewDepartmentService(departmentRepo)
}

func TestGetSupervisorByDepartmentID(t *testing.T) {
	setupDepartmentService()

	// Setup: Create a supervisor and a department with that supervisor
	supervisor := &model.User{
		Email:    "supervisor@example.com",
		Username: "supervisor",
		Password: "securepassword",
	}
	orm.DB.Create(&supervisor)

	// Convert supervisor.ID to a pointer
	supervisorID := &supervisor.ID

	department := &model.Department{
		Name:         "Engineering",
		SupervisorID: supervisorID,
	}
	orm.DB.Create(&department)

	// Test the service
	fetchedSupervisor, err := departmentService.GetSupervisorByDepartmentID(department.ID)
	assert.NoError(t, err)
	assert.NotNil(t, fetchedSupervisor)
	assert.Equal(t, "supervisor", fetchedSupervisor.Username)

	// Cleanup
	orm.DB.Unscoped().Delete(&department)
	orm.DB.Unscoped().Delete(&supervisor)
}
func TestCreateClient(t *testing.T) {
	setupDepartmentService()

	// Test the service
	client, err := departmentService.CreateClient("ClientName")
	assert.NoError(t, err)
	assert.NotNil(t, client)
	assert.Equal(t, "ClientName", client.Name)

	// Cleanup
	orm.DB.Unscoped().Delete(&client)
}

func TestCreateDepartment(t *testing.T) {
	setupDepartmentService()

	// Setup: Create a client and a supervisor
	client := &model.Department{
		Name: "ClientName",
	}
	orm.DB.Create(&client)

	supervisor := &model.User{
		Email:    "supervisor@example.com",
		Username: "supervisor",
		Password: "securepassword",
	}
	orm.DB.Create(&supervisor)

	// Convert supervisor.ID to a pointer
	supervisorID := &supervisor.ID

	// Test the service
	department, err := departmentService.CreateDepartment("DepartmentName", client.Name, *supervisorID)
	assert.NoError(t, err)
	assert.NotNil(t, department)
	assert.Equal(t, "DepartmentName", department.Name)

	// Cleanup
	orm.DB.Unscoped().Delete(&department)
	orm.DB.Unscoped().Delete(&client)
	orm.DB.Unscoped().Delete(&supervisor)
}
func TestGetDepartmentByID(t *testing.T) {
	setupDepartmentService()

	// Setup: Create a department
	department := &model.Department{
		Name: "DepartmentName",
	}
	orm.DB.Create(&department)

	// Test the service
	fetchedDepartment, err := departmentService.GetDepartmentByID(department.ID)
	assert.NoError(t, err)
	assert.NotNil(t, fetchedDepartment)
	assert.Equal(t, "DepartmentName", fetchedDepartment.Name)

	// Cleanup
	orm.DB.Unscoped().Delete(&department)
}

func TestGetAllClients(t *testing.T) {
	setupDepartmentService()

	// Cleanup any existing clients in the database to ensure a clean state
	orm.DB.Exec("DELETE FROM departments WHERE parent_department_id IS NULL")

	// Setup: Create multiple clients
	client1 := &model.Department{
		Name: "Client1",
	}
	client2 := &model.Department{
		Name: "Client2",
	}
	orm.DB.Create(&client1)
	orm.DB.Create(&client2)

	// Test the service
	clients, err := departmentService.GetAllClients()
	assert.NoError(t, err)
	assert.Len(t, clients, 2)

	// Cleanup
	orm.DB.Unscoped().Delete(&client1)
	orm.DB.Unscoped().Delete(&client2)
}

func TestUpdateDepartment(t *testing.T) {
	setupDepartmentService()

	// Setup: Create a department and a supervisor
	supervisor := &model.User{
		Email:    "supervisor@example.com",
		Username: "supervisor",
		Password: "securepassword",
	}
	orm.DB.Create(&supervisor)

	// Convert supervisor.ID to a pointer
	supervisorID := &supervisor.ID

	department := &model.Department{
		Name:         "OldDepartmentName",
		SupervisorID: supervisorID,
	}
	orm.DB.Create(&department)

	// Test the service
	err := departmentService.UpdateDepartment(department.ID, "NewDepartmentName", *supervisorID)
	assert.NoError(t, err)

	// Verify the update
	updatedDepartment, err := departmentService.GetDepartmentByID(department.ID)
	assert.NoError(t, err)
	assert.Equal(t, "NewDepartmentName", updatedDepartment.Name)

	// Cleanup
	orm.DB.Unscoped().Delete(&department)
	orm.DB.Unscoped().Delete(&supervisor)
}
func TestDeleteDepartment(t *testing.T) {
	setupDepartmentService()

	// Setup: Create a department
	department := &model.Department{
		Name: "DepartmentToDelete",
	}
	orm.DB.Create(&department)

	// Test the service
	err := departmentService.DeleteDepartment(department.ID)
	assert.NoError(t, err)

	// Verify deletion
	deletedDepartment, err := departmentService.GetDepartmentByID(department.ID)
	assert.Error(t, err)
	assert.Nil(t, deletedDepartment)
}

func TestGetUsersByDepartmentID(t *testing.T) {
	setupDepartmentService()

	// Setup: Create a department and users
	department := &model.Department{
		Name: "Engineering",
	}
	orm.DB.Create(&department)

	user1 := &model.User{
		Email:        "user1@example.com",
		Username:     "user1",
		Password:     "password",
		DepartmentID: department.ID,
	}
	user2 := &model.User{
		Email:        "user2@example.com",
		Username:     "user2",
		Password:     "password",
		DepartmentID: department.ID,
	}
	orm.DB.Create(&user1)
	orm.DB.Create(&user2)

	// Test the service
	users, err := departmentService.GetUsersByDepartmentID(department.ID)
	assert.NoError(t, err)
	assert.Len(t, users, 2)

	// Cleanup
	orm.DB.Unscoped().Delete(&user1)
	orm.DB.Unscoped().Delete(&user2)
	orm.DB.Unscoped().Delete(&department)
}
