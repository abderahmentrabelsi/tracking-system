package repository

import (
	"back/internal/model"
	"back/internal/orm"
	"fmt"
)

type ProjectRepository struct{}

func NewProjectRepository() *ProjectRepository {
	return &ProjectRepository{}
}

func (pr *ProjectRepository) CreateProject(project *models.Project) error {
	if err := orm.DB.Create(project).Error; err != nil {
		return fmt.Errorf("failed to create project: %v", err)
	}
	return nil
}

func (pr *ProjectRepository) GetProjectByID(projectID uint) (*models.Project, error) {
	var project models.Project
	if err := orm.DB.Preload("Managers").Preload("Users").First(&project, projectID).Error; err != nil {
		return nil, fmt.Errorf("failed to retrieve project: %v", err)
	}
	return &project, nil
}

func (pr *ProjectRepository) UpdateProject(projectID uint, updatedProject *models.Project) error {
	var project models.Project
	if err := orm.DB.First(&project, projectID).Error; err != nil {
		return fmt.Errorf("failed to retrieve project: %v", err)
	}

	project.Name = updatedProject.Name
	project.StartDate = updatedProject.StartDate
	project.Deadline = updatedProject.Deadline
	project.Budget = updatedProject.Budget
	project.Description = updatedProject.Description
	project.Managers = updatedProject.Managers
	project.Users = updatedProject.Users
	project.Tasks = updatedProject.Tasks

	if err := orm.DB.Save(&project).Error; err != nil {
		return fmt.Errorf("failed to update project: %v", err)
	}
	return nil
}

func (pr *ProjectRepository) DeleteProject(projectID uint) error {
	if err := orm.DB.Delete(&models.Project{}, projectID).Error; err != nil {
		return fmt.Errorf("failed to delete project: %v", err)
	}
	return nil
}

func (pr *ProjectRepository) GetProjectsByUserID(userID uint) ([]models.Project, error) {
	var projects []models.Project
	if err := orm.DB.Preload("Managers").Preload("Users").Joins("JOIN project_users ON project_users.project_id = projects.id").Where("project_users.user_id = ?", userID).Find(&projects).Error; err != nil {
		return nil, fmt.Errorf("failed to retrieve projects: %v", err)
	}
	return projects, nil
}

func (pr *ProjectRepository) AddUserToProject(projectID uint, userID uint) error {
	project, err := pr.GetProjectByID(projectID)
	if err != nil {
		return err
	}

	var user models.User
	if err := orm.DB.First(&user, userID).Error; err != nil {
		return fmt.Errorf("failed to retrieve user: %v", err)
	}

	if err := orm.DB.Model(&project).Association("Users").Append(&user); err != nil {
		return fmt.Errorf("failed to add user to project: %v", err)
	}
	return nil
}

func (pr *ProjectRepository) RemoveUserFromProject(projectID uint, userID uint) error {
	project, err := pr.GetProjectByID(projectID)
	if err != nil {
		return err
	}

	var user models.User
	if err := orm.DB.First(&user, userID).Error; err != nil {
		return fmt.Errorf("failed to retrieve user: %v", err)
	}

	if err := orm.DB.Model(&project).Association("Users").Delete(&user); err != nil {
		return fmt.Errorf("failed to remove user from project: %v", err)
	}
	return nil
}

func (pr *ProjectRepository) GetManagersByProjectID(projectID uint) ([]models.User, error) {
	var managers []models.User
	if err := orm.DB.Joins("JOIN project_managers ON project_managers.user_id = users.id").Where("project_managers.project_id = ?", projectID).Find(&managers).Error; err != nil {
		return nil, fmt.Errorf("failed to retrieve managers: %v", err)
	}
	return managers, nil
}

func (pr *ProjectRepository) GetUsersByProjectID(projectID uint) ([]models.User, error) {
	var users []models.User
	if err := orm.DB.Joins("JOIN project_users ON project_users.user_id = users.id").Where("project_users.project_id = ?", projectID).Find(&users).Error; err != nil {
		return nil, fmt.Errorf("failed to retrieve users: %v", err)
	}
	return users, nil
}

func (pr *ProjectRepository) AddManagerToProject(projectID uint, managerID uint) error {
	project, err := pr.GetProjectByID(projectID)
	if err != nil {
		return err
	}

	var manager models.User
	if err := orm.DB.First(&manager, managerID).Error; err != nil {
		return fmt.Errorf("failed to retrieve manager: %v", err)
	}

	if err := orm.DB.Model(&project).Association("Managers").Append(&manager); err != nil {
		return fmt.Errorf("failed to add manager to project: %v", err)
	}
	return nil
}

func (pr *ProjectRepository) RemoveManagerFromProject(projectID uint, managerID uint) error {
	project, err := pr.GetProjectByID(projectID)
	if err != nil {
		return err
	}

	var manager models.User
	if err := orm.DB.First(&manager, managerID).Error; err != nil {
		return fmt.Errorf("failed to retrieve manager: %v", err)
	}

	if err := orm.DB.Model(&project).Association("Managers").Delete(&manager); err != nil {
		return fmt.Errorf("failed to remove manager from project: %v", err)
	}
	return nil
}
