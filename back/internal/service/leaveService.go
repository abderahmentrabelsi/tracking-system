package service

import (
	"fmt"

	model "back/internal/model"
	"back/internal/repository"
)

type LeaveService struct {
	leaveRepo *repository.LeaveRepository
}

func NewLeaveService(leaveRepo *repository.LeaveRepository) *LeaveService {
	return &LeaveService{
		leaveRepo: leaveRepo,
	}
}

func (s *LeaveService) CreateLeaveRequest(leaveRequest *model.LeaveRequest) error {
	leaveRequest.LeaveStatus = "Processing"
	leaveRequest.Approved = false
	return s.leaveRepo.CreateLeaveRequest(leaveRequest)
}

func (s *LeaveService) ApproveLeaveRequest(leaveRequestID uint, approve bool, managerComment string) error {
	leaveRequest, err := s.leaveRepo.GetLeaveRequestByID(leaveRequestID)
	if err != nil {
		return err
	}
	if leaveRequest == nil {
		return fmt.Errorf("leave request not found")
	}

	if approve {
		leaveRequest.LeaveStatus = "Approved"
		leaveRequest.Approved = true
	} else {
		leaveRequest.LeaveStatus = "Declined"
		leaveRequest.Approved = false
	}
	leaveRequest.ManagerComment = managerComment
	return s.leaveRepo.UpdateLeaveRequest(leaveRequest)
}

func (s *LeaveService) GetLeaveRequests(userID uint) ([]*model.LeaveRequest, error) {
	return s.leaveRepo.GetLeaveRequestsByUserID(userID)
}

func (s *LeaveService) DeleteLeaveRequest(leaveRequestID uint) error {
	return s.leaveRepo.DeleteLeaveRequest(leaveRequestID)
}
