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

func (s *WorkHoursService) CheckIn(userID uint, workType, location, comments string, taskID *uint) (*models.WorkHours, error) {
	now := time.Now().Unix()
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

func (s *WorkHoursService) CheckOut(workHoursID uint) (*models.WorkHours, error) {
	workHours, err := s.workHoursRepo.GetWorkHoursByID(workHoursID)
	if err != nil {
		return nil, err
	}
	if workHours == nil {
		return nil, fmt.Errorf("work hours entry not found")
	}
	now := time.Now().Unix()
	workHours.Checkout = &now
	workHours.Duration = float32(now-workHours.Checkin) / 3600
	if err := s.workHoursRepo.UpdateWorkHours(workHours); err != nil {
		return nil, err
	}
	return workHours, nil
}

func (s *WorkHoursService) GetTimesheet(userID uint) ([]*models.WorkHours, error) {
	return s.workHoursRepo.GetWorkHoursByUserID(userID)
}

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

func (s *WorkHoursService) GetTimesheetByDateRange(startDate, endDate time.Time) ([]*models.WorkHours, error) {
	return s.workHoursRepo.GetWorkHoursByDateRange(startDate, endDate)
}
