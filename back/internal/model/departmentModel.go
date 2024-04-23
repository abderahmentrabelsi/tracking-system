package models

import (
	"gorm.io/gorm"
)

type Department struct {
	gorm.Model
	Name         string `json:"name"`
	SupervisorID uint   `json:"supervisorId"`
	Users        []User `gorm:"foreignKey:DepartmentID" json:"users"`
}
