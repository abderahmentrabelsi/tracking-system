package models

import (
	"gorm.io/gorm"
	"time"
)

type User struct {
	gorm.Model
	ID           uint   `gorm:"primaryKey"`
	Username     string `json:"username" gorm:"unique"`
	Password     string `json:"password"`
	Email        string `json:"email" gorm:"unique"`
	RoleID       uint   `json:"roleId"`
	Role         Role   `gorm:"foreignKey:RoleID"`
	FirstName    string `json:"firstName"`
	LastName     string `json:"lastName"`
	JobName      string `json:"JobName"`
	Picture      string `json:"picture"`
	PhoneNumber  string `json:"phoneNumber"`
	Address      string `json:"address"`
	DepartmentID uint
	Department   Department     `gorm:"foreignKey:DepartmentID"`
	LoginHistory []LoginHistory `gorm:"foreignKey:UserID" json:"loginHistory"`
	WorkHours    []WorkHours    `gorm:"foreignKey:UserID" json:"workHours"`
	TokenDetails TokenDetails   `gorm:"foreignKey:UserID" json:"tokenDetails"`
	Salary       Salary         `gorm:"foreignKey:UserID" json:"salary"`
	Contract     Contract       `gorm:"foreignKey:UserID" json:"contract"`
	Files        []FileUpload   `gorm:"foreignKey:UserID" json:"files"`
}

type Role struct {
	gorm.Model
	Name        string       `json:"name"`
	Permissions []Permission `gorm:"many2many:role_permissions"`
}

type Permission struct {
	gorm.Model
	Name        string `json:"name"`
	Description string `json:"description"`
}

type RolePermission struct {
	gorm.Model
	RoleID       uint `json:"roleId"`
	PermissionID uint `json:"permissionId"`
}

type LoginHistory struct {
	gorm.Model
	UserID      uint      `json:"userId"`
	LoginIP     string    `json:"loginIp"`
	LoginDevice string    `json:"loginDevice"`
	LoginTime   time.Time `json:"loginTime"`
}

type WorkHours struct {
	gorm.Model
	ID             uint    `gorm:"primaryKey"`
	UserID         uint    `json:"userId"`
	TaskID         *uint   `json:"taskId,omitempty"`
	Checkin        int64   `json:"checkin"`
	Checkout       *int64  `json:"checkout,omitempty"`
	Duration       float32 `json:"duration"`
	WorkType       string  `json:"workType"`
	Location       string  `json:"location"`
	Comments       string  `json:"comments"`
	Approved       bool    `json:"approved"`
	RequestedEdit  bool    `json:"requestedEdit"`
	EditRequestMsg string  `json:"editRequestMsg"`
	ManagerComment string  `json:"managerComment"`
}

type TokenDetails struct {
	gorm.Model
	UserID       uint      `json:"userId"`
	AccessToken  string    `json:"accessToken"`
	RefreshToken string    `json:"refreshToken"`
	TokenExpiry  time.Time `json:"tokenExpiry"`
	TOTPSecret   string    `json:"totpSecret"`
}

type Salary struct {
	gorm.Model
	UserID                uint    `json:"userId"`
	Base                  int64   `json:"base"`
	Subsidy               int64   `json:"subsidy"`
	Bonus                 int64   `json:"bonus"`
	Commission            int64   `json:"commission"`
	Other                 int64   `json:"other"`
	Fund                  int64   `json:"fund"`
	PensionInsurance      float64 `json:"pension_insurance"`
	UnemploymentInsurance float64 `json:"unemployment_insurance"`
	MedicalInsurance      float64 `json:"medical_insurance"`
	HousingFund           float64 `json:"housing_fund"`
	Tax                   float64 `json:"tax"`
	Overtime              int64   `json:"overtime"`
	Total                 float64 `json:"total"`
	IsPay                 int64   `json:"is_pay"`
	SalaryDate            string  `json:"salary_date"`
}

type Contract struct {
	gorm.Model
	UserID         uint       `json:"userId"`
	ContractType   string     `json:"contractType"` // e.g., CDI, CDD
	StartDate      time.Time  `json:"startDate"`
	EndDate        *time.Time `json:"endDate,omitempty"`
	ContractStatus string     `json:"contractStatus"` // e.g., Active, Terminated
}
