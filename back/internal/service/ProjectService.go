package service

import (
	"back/internal/model"
	"back/internal/repository"
	"fmt"
)

type ProjectService struct {
	repo *repository.ProjectRepository
}

func NewProjectService(repo *repository.ProjectRepository) *ProjectService {
	return &ProjectService{
		repo: repo,
	}
}

func (ps *ProjectService) CreateProject(project *models.Project) error {
	return ps.repo.CreateProject(project)
}

func (ps *ProjectService) GetProjectByID(projectID uint) (*models.Project, error) {
	project, err := ps.repo.GetProjectByID(projectID)
	if err != nil {
		return nil, fmt.Errorf("could not get project: %v", err)
	}
	return project, nil
}

func (ps *ProjectService) UpdateProject(projectID uint, updatedProject *models.Project) error {
	if err := ps.repo.UpdateProject(projectID, updatedProject); err != nil {
		return fmt.Errorf("could not update project: %v", err)
	}
	return nil
}

func (ps *ProjectService) DeleteProject(projectID uint) error {
	if err := ps.repo.DeleteProject(projectID); err != nil {
		return fmt.Errorf("could not delete project: %v", err)
	}
	return nil
}

func (ps *ProjectService) GetProjectsByUserID(userID uint) ([]models.Project, error) {
	projects, err := ps.repo.GetProjectsByUserID(userID)
	if err != nil {
		return nil, fmt.Errorf("could not get projects: %v", err)
	}
	return projects, nil
}

func (ps *ProjectService) AddUserToProject(projectID uint, userID uint) error {
	if err := ps.repo.AddUserToProject(projectID, userID); err != nil {
		return fmt.Errorf("could not add user to project: %v", err)
	}
	return nil
}

func (ps *ProjectService) RemoveUserFromProject(projectID uint, userID uint) error {
	if err := ps.repo.RemoveUserFromProject(projectID, userID); err != nil {
		return fmt.Errorf("could not remove user from project: %v", err)
	}
	return nil
}

func (ps *ProjectService) GetManagersByProjectID(projectID uint) ([]models.User, error) {
	managers, err := ps.repo.GetManagersByProjectID(projectID)
	if err != nil {
		return nil, fmt.Errorf("could not get managers: %v", err)
	}
	return managers, nil
}

func (ps *ProjectService) GetUsersByProjectID(projectID uint) ([]models.User, error) {
	users, err := ps.repo.GetUsersByProjectID(projectID)
	if err != nil {
		return nil, fmt.Errorf("could not get users: %v", err)
	}
	return users, nil
}

func (ps *ProjectService) AddManagerToProject(projectID uint, managerID uint) error {
	if err := ps.repo.AddManagerToProject(projectID, managerID); err != nil {
		return fmt.Errorf("could not add manager to project: %v", err)
	}
	return nil
}

func (ps *ProjectService) RemoveManagerFromProject(projectID uint, managerID uint) error {
	if err := ps.repo.RemoveManagerFromProject(projectID, managerID); err != nil {
		return fmt.Errorf("could not remove manager from project: %v", err)
	}
	return nil
}
