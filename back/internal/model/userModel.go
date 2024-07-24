package models

import (
	"gorm.io/gorm"
	"time"
)

type User struct {
	gorm.Model
	ID                uint               `gorm:"primaryKey"`
	Username          string             `json:"username" gorm:"unique"`
	Password          string             `json:"password"`
	Email             string             `json:"email" gorm:"unique"`
	RoleID            uint               `json:"roleId"`
	Role              Role               `gorm:"foreignKey:RoleID"`
	FirstName         string             `json:"firstName"`
	LastName          string             `json:"lastName"`
	Picture           string             `json:"picture"`
	PhoneNumber       string             `json:"phoneNumber"`
	Address           string             `json:"address"`
	JobTitle          string             `json:"jobTitle"`
	DepartmentID      uint               // DONE
	Department        Department         `gorm:"foreignKey:DepartmentID"`
	LoginHistory      []LoginHistory     `gorm:"foreignKey:UserID" json:"loginHistory"`
	WorkHours         []WorkHours        `gorm:"foreignKey:UserID" json:"workHours"`
	TOTPSecret        string             `json:"totpSecret"`
	TOTPEnabled       bool               `json:"totpEnabled"`
	Salary            Salary             `gorm:"foreignKey:UserID" json:"salary"`
	Contract          Contract           `gorm:"foreignKey:UserID" json:"contract"`
	Files             []FileUpload       `gorm:"foreignKey:UserID" json:"files"`
	SourceOfHire      string             `json:"sourceOfHire"`
	ReportingManager  string             `json:"reportingManager"`
	Gender            string             `json:"gender"`
	MaritalStatus     string             `json:"maritalStatus"` // e.g., Single, Married
	AddedBy           string             `json:"addedBy"`
	ModifiedBy        string             `json:"modifiedBy"`
	OnBoardingStatus  string             `json:"onBoardingStatus"` // e.g., Not Triggered, Triggered
	EducationDetails  []EducationDetail  `gorm:"foreignKey:UserID" json:"educationDetails"`
	EmergencyContacts []EmergencyContact `gorm:"foreignKey:UserID" json:"emergencyContacts"`
}

type EducationDetail struct {
	gorm.Model
	UserID         uint   `json:"userId"`
	InstituteName  string `json:"instituteName"`
	Diploma        string `json:"diploma"`
	Specialization string `json:"specialization"`
}

type EmergencyContact struct {
	gorm.Model
	UserID uint   `json:"userId"`
	Name   string `json:"name"`
	Number string `json:"number"`
}

type Role struct {
	gorm.Model
	Name string `json:"name"`
}

type LoginHistory struct {
	gorm.Model
	UserID      uint      `json:"userId"`
	LoginIP     string    `json:"loginIp"`
	LoginDevice string    `json:"loginDevice"`
	LoginTime   time.Time `json:"loginTime"`
	Location    string    `json:"location"`
}

type WorkHours struct {
	gorm.Model
	ID              uint     `gorm:"primaryKey"`
	UserID          uint     `json:"userId"`
	TaskID          *uint    `json:"taskId,omitempty"`
	Checkin         int64    `json:"checkin"`
	Checkout        *int64   `json:"checkout,omitempty"`
	Duration        float32  `json:"duration"`
	WorkType        string   `json:"workType"`
	Location        string   `json:"location"`
	Comments        string   `json:"comments"`
	Approved        bool     `json:"approved"`
	RequestedEdit   bool     `json:"requestedEdit"`
	EditRequestMsg  string   `json:"editRequestMsg"`
	ManagerComment  string   `json:"managerComment"`
	RequestCheckin  *int64   `json:"requestCheckin,omitempty"`
	RequestCheckout *int64   `json:"requestCheckout,omitempty"`
	RequestDuration *float32 `json:"requestDuration,omitempty"`
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
