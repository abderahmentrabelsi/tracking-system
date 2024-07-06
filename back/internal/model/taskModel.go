package models

import (
	"gorm.io/gorm"
	"time"
)

type Task struct {
	gorm.Model
	ID              uint       `gorm:"primaryKey"`
	Title           string     `json:"title"`
	Description     string     `json:"description"`
	Status          string     `json:"status"`
	RequestedStatus string     `json:"requestedStatus"`
	AssigneeID      uint       `json:"assigneeId"`
	Assignee        User       `gorm:"foreignKey:AssigneeID" json:"assignee"`
	ManagerID       uint       `json:"managerId"`
	Manager         User       `gorm:"foreignKey:ManagerID" json:"manager"`
	DueDate         time.Time  `json:"dueDate"`
	DepartmentID    uint       `json:"departmentId"`
	Department      Department `gorm:"foreignKey:DepartmentID"`
	Comments        []Comment  `gorm:"foreignKey:TaskID;constraint:OnDelete:CASCADE;" json:"comments"`
}

type Comment struct {
	gorm.Model
	ID        uint      `gorm:"primaryKey"`
	TaskID    uint      `json:"taskId"`
	Task      Task      `gorm:"foreignKey:TaskID"`
	UserID    uint      `json:"userId"`
	User      User      `gorm:"foreignKey:UserID"`
	Content   string    `json:"content"`
	CreatedAt time.Time `json:"createdAt"`
}

type Project struct {
	gorm.Model
	ID           uint       `gorm:"primaryKey"`
	Name         string     `json:"name"`
	Description  string     `json:"description"`
	DepartmentID uint       `json:"departmentId"`
	Department   Department `gorm:"foreignKey:DepartmentID"`
	Managers     []User     `gorm:"many2many:project_managers;" json:"managers"`
	Users        []User     `gorm:"many2many:project_users;" json:"users"`
	Tasks        []Task     `gorm:"foreignKey:ProjectID" json:"tasks"`
	Task         Task       `gorm:"foreignKey:TaskID"`
}
