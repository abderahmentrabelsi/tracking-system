package models

import (
	"gorm.io/gorm"
)

type LeaveRequest struct {
	gorm.Model
	ID             uint    `gorm:"primaryKey"`
	UserID         uint    `json:"userId"`
	StartDate      int64   `json:"startDate"`
	EndDate        int64   `json:"endDate"`
	Duration       float32 `json:"duration"`
	LeaveType      string  `json:"leaveType"`
	Paid           bool    `json:"paid"`
	Comments       string  `json:"comments"`
	LeaveStatus    string  `json:"leaveStatus"`
	ManagerComment string  `json:"managerComment,omitempty"`
	Approved       bool    `json:"approved"`
}
