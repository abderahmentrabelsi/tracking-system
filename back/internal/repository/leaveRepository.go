package repository

import (
	model "back/internal/model"
	"back/internal/orm"
	"gorm.io/gorm"
)

type LeaveRepository struct{}

func NewLeaveRepository() *LeaveRepository {
	return &LeaveRepository{}
}

func (r *LeaveRepository) CreateLeaveRequest(leaveRequest *model.LeaveRequest) error {
	return orm.DB.Create(leaveRequest).Error
}

func (r *LeaveRepository) UpdateLeaveRequest(leaveRequest *model.LeaveRequest) error {
	return orm.DB.Save(leaveRequest).Error
}

func (r *LeaveRepository) GetLeaveRequestByID(id uint) (*model.LeaveRequest, error) {
	var leaveRequest model.LeaveRequest
	if err := orm.DB.First(&leaveRequest, id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, nil
		}
		return nil, err
	}
	return &leaveRequest, nil
}

func (r *LeaveRepository) GetLeaveRequestsByUserID(userID uint) ([]*model.LeaveRequest, error) {
	var leaveRequests []*model.LeaveRequest
	if err := orm.DB.Where("user_id = ?", userID).Find(&leaveRequests).Error; err != nil {
		return nil, err
	}
	return leaveRequests, nil
}

func (r *LeaveRepository) DeleteLeaveRequest(id uint) error {
	return orm.DB.Delete(&model.LeaveRequest{}, id).Error
}
