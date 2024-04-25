package models

import (
	"back/internal/orm"
	"fmt"
	"gorm.io/gorm"
)

type Department struct {
	gorm.Model
	ID           uint   `gorm:"primaryKey"`
	Name         string `json:"name"`
	SupervisorID uint   `json:"supervisorId"`
	Users        []User `gorm:"foreignKey:DepartmentID" json:"users"`
}

func GetDepartmentByID(id uint) (*Department, error) {
	var department Department
	err := orm.DB.Where("id = ?", id).First(&department).Error
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, fmt.Errorf("Department with ID %d does not exist", id)
		}
		return nil, fmt.Errorf("Database error occurred: %v", err)
	}
	return &department, nil
}
