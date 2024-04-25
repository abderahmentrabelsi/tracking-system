package models

import (
	"back/internal/orm"
	"gorm.io/gorm"
	"time"
)

type Role string

const (
	Admin    Role = "Admin"
	Employee Role = "Employee"
)

type User struct {
	gorm.Model
	Username     string `json:"username"`
	Password     string `json:"password"`
	Email        string `json:"email"`
	role         Role   `json:"role"`
	FirstName    string `json:"firstName"`
	LastName     string `json:"lastName"`
	Picture      string `json:"picture"`
	PhoneNumber  string `json:"phoneNumber"`
	Address      string `json:"address"`
	DepartmentID uint
	Department   Department     `gorm:"foreignKey:DepartmentID"`
	LoginHistory []LoginHistory `gorm:"foreignKey:UserID" json:"loginHistory"`
	WorkHours    []WorkHours    `gorm:"foreignKey:UserID" json:"workHours"`
	TokenDetails TokenDetails   `gorm:"foreignKey:UserID" json:"tokenDetails"`
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
	UserID   uint      `json:"userId"`
	Checkin  time.Time `json:"checkin"`
	Checkout time.Time `json:"checkout"`
	Duration float32   `json:"duration"`
	WorkType string    `json:"workType"`
	Location string    `json:"location"`
	Comments string    `json:"comments"`
}

type TokenDetails struct {
	gorm.Model
	UserID       uint      `json:"userId"`
	AccessToken  string    `json:"accessToken"`
	RefreshToken string    `json:"refreshToken"`
	TokenExpiry  time.Time `json:"tokenExpiry"`
	TOTPSecret   string    `json:"totpSecret"`
}

func GetUserByEmail(email string) (*User, error) {
	var user User
	err := orm.DB.Where("email = ?", email).First(&user).Error
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, nil
		}
		return nil, err
	}
	return &user, nil
}

func CreateUser(user *User) error {
	return orm.DB.Create(user).Error
}
