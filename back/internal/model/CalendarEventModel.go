package models

import (
	"gorm.io/gorm"
	"time"
)

type Calendar struct {
	gorm.Model
	Location     string          `json:"location"`
	Name         string          `json:"name"`
	Active       bool            `json:"active"`
	Color        int             `json:"color"`
	Overlap      bool            `json:"overlap"`
	Attributes   string          `json:"attributes"`
	ImageURL     string          `json:"image_url"`
	DepartmentID uint            `json:"department_id"`
	Department   Department      `gorm:"foreignKey:DepartmentID"`
	CreatedByID  uint            `json:"created_by_id"`
	CreatedBy    User            `gorm:"foreignKey:CreatedByID"`
	Events       []CalendarEvent `json:"events"`
}

type CalendarEvent struct {
	gorm.Model
	StartDT      time.Time  `json:"start_dt"`
	EndDT        time.Time  `json:"end_dt"`
	AllDay       bool       `json:"all_day"`
	Title        string     `json:"title"`
	Who          string     `json:"who"`
	Location     string     `json:"location"`
	Notes        string     `json:"notes"`
	IsRemote     bool       `json:"is_remote"`
	Attendance   string     `json:"attendance"`
	CalendarID   uint       `json:"calendar_id"`
	Calendar     Calendar   `gorm:"foreignKey:CalendarID"`
	Version      string     `json:"version"`
	DepartmentID uint       `json:"department_id"`
	Department   Department `gorm:"foreignKey:DepartmentID"`
}
