package service

import (
	"back/internal/model"
	"back/internal/repository"
	"fmt"
	"time"
)

type WorkHoursService struct {
	workHoursRepo *repository.WorkHoursRepository
}

func NewWorkHoursService(workHoursRepo *repository.WorkHoursRepository) *WorkHoursService {
	return &WorkHoursService{workHoursRepo: workHoursRepo}
}

// CheckIn creates a new work hours entry with the current time as check-in
func (s *WorkHoursService) CheckIn(userID uint, workType, location, comments string, taskID *uint) (*models.WorkHours, error) {
	now := time.Now()
	workHours := &models.WorkHours{
		UserID:   userID,
		TaskID:   taskID,
		Checkin:  now,
		WorkType: workType,
		Location: location,
		Comments: comments,
	}
	if err := s.workHoursRepo.CreateWorkHours(workHours); err != nil {
		return nil, err
	}
	return workHours, nil
}

// CheckOut updates the existing work hours entry with the current time as check-out
func (s *WorkHoursService) CheckOut(workHoursID uint) (*models.WorkHours, error) {
	workHours, err := s.workHoursRepo.GetWorkHoursByID(workHoursID)
	if err != nil {
		return nil, err
	}
	if workHours == nil {
		return nil, fmt.Errorf("work hours entry not found")
	}
	now := time.Now()
	workHours.Checkout = &now
	workHours.Duration = float32(now.Sub(workHours.Checkin).Hours())
	if err := s.workHoursRepo.UpdateWorkHours(workHours); err != nil {
		return nil, err
	}
	return workHours, nil
}

// GetTimesheet retrieves the timesheet for a specific user
func (s *WorkHoursService) GetTimesheet(userID uint) ([]*models.WorkHours, error) {
	return s.workHoursRepo.GetWorkHoursByUserID(userID)
}

// RequestEdit requests an edit for a work hours entry
func (s *WorkHoursService) RequestEdit(workHoursID uint, editRequestMsg string) (*models.WorkHours, error) {
	workHours, err := s.workHoursRepo.GetWorkHoursByID(workHoursID)
	if err != nil {
		return nil, err
	}
	if workHours == nil {
		return nil, fmt.Errorf("work hours entry not found")
	}
	workHours.RequestedEdit = true
	workHours.EditRequestMsg = editRequestMsg
	if err := s.workHoursRepo.UpdateWorkHours(workHours); err != nil {
		return nil, err
	}
	return workHours, nil
}

// ApproveEdit approves or denies a work hours edit request
func (s *WorkHoursService) ApproveEdit(workHoursID uint, approved bool, managerComment string) (*models.WorkHours, error) {
	workHours, err := s.workHoursRepo.GetWorkHoursByID(workHoursID)
	if err != nil {
		return nil, err
	}
	if workHours == nil {
		return nil, fmt.Errorf("work hours entry not found")
	}
	workHours.Approved = approved
	workHours.RequestedEdit = false
	workHours.ManagerComment = managerComment
	if err := s.workHoursRepo.UpdateWorkHours(workHours); err != nil {
		return nil, err
	}
	return workHours, nil
}

// GetTimesheetByDateRange retrieves work hours entries within a specific date range
func (s *WorkHoursService) GetTimesheetByDateRange(startDate, endDate time.Time) ([]*models.WorkHours, error) {
	return s.workHoursRepo.GetWorkHoursByDateRange(startDate, endDate)
}
