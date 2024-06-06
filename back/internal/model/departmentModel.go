package models

import (
	"gorm.io/gorm"
)

type Department struct {
	gorm.Model
	ID                 uint         `gorm:"primaryKey"`
	Name               string       `json:"name"`
	SupervisorID       *uint        `json:"supervisorId,omitempty"`
	Supervisor         *User        `gorm:"foreignKey:SupervisorID" json:"-"`
	ParentDepartmentID *uint        `json:"parentDepartmentId,omitempty"`
	ParentDepartment   *Department  `gorm:"foreignKey:ParentDepartmentID" json:"-"`
	Users              []User       `gorm:"foreignKey:DepartmentID" json:"users"`
	Permissions        []Permission `gorm:"many2many:department_permissions;" json:"permissions"`
}
