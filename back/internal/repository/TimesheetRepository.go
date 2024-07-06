package repository

import (
	"back/internal/model"
	"back/internal/orm"
	"gorm.io/gorm"
	"time"
)

type WorkHoursRepository struct{}

func NewWorkHoursRepository() *WorkHoursRepository {
	return &WorkHoursRepository{}
}

func (r *WorkHoursRepository) CreateWorkHours(workHours *models.WorkHours) error {
	if err := orm.DB.Create(workHours).Error; err != nil {
		return err
	}
	return nil
}

func (r *WorkHoursRepository) UpdateWorkHours(workHours *models.WorkHours) error {
	if err := orm.DB.Save(workHours).Error; err != nil {
		return err
	}
	return nil
}

func (r *WorkHoursRepository) GetWorkHoursByID(id uint) (*models.WorkHours, error) {
	var workHours models.WorkHours
	if err := orm.DB.First(&workHours, id).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return nil, nil
		}
		return nil, err
	}
	return &workHours, nil
}

func (r *WorkHoursRepository) GetWorkHoursByUserID(userID uint) ([]*models.WorkHours, error) {
	var workHours []*models.WorkHours
	if err := orm.DB.Where("user_id = ?", userID).Find(&workHours).Error; err != nil {
		return nil, err
	}
	return workHours, nil
}

func (r *WorkHoursRepository) GetWorkHoursByDateRange(startDate, endDate time.Time) ([]*models.WorkHours, error) {
	var workHours []*models.WorkHours
	if err := orm.DB.Where("checkin >= ? AND checkout <= ?", startDate.Unix(), endDate.Unix()).Find(&workHours).Error; err != nil {
		return nil, err
	}
	return workHours, nil
}
