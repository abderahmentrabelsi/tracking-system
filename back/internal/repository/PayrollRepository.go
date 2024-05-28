package repository

import (
	"back/internal/model"
	"back/internal/orm"
	"fmt"
)

type PayrollRepository struct{}

func NewPayrollRepository() *PayrollRepository {
	return &PayrollRepository{}
}

func (pr *PayrollRepository) CreateSalaryRecord(salary *models.Salary) error {
	if err := orm.DB.Create(salary).Error; err != nil {
		return fmt.Errorf("failed to create salary record: %v", err)
	}
	return nil
}

func (pr *PayrollRepository) GetSalaryRecordsByUserID(userID uint) ([]*models.Salary, error) {
	var salaries []*models.Salary
	if err := orm.DB.Where("user_id = ?", userID).Find(&salaries).Error; err != nil {
		return nil, fmt.Errorf("failed to find salary records by user ID: %v", err)
	}
	return salaries, nil
}

func (pr *PayrollRepository) UpdateSalaryRecordByUserID(salary *models.Salary) error {
	if err := orm.DB.Model(&models.Salary{}).Where("user_id = ?", salary.UserID).Updates(salary).Error; err != nil {
		return fmt.Errorf("failed to update salary record by user ID: %v", err)
	}
	return nil
}

func (pr *PayrollRepository) DeleteSalaryRecordByUserID(userID uint) error {
	if err := orm.DB.Where("user_id = ?", userID).Delete(&models.Salary{}).Error; err != nil {
		return fmt.Errorf("failed to delete salary record by user ID: %v", err)
	}
	return nil
}

func (pr *PayrollRepository) CreateContractRecord(contract *models.Contract) error {
	if err := orm.DB.Create(contract).Error; err != nil {
		return fmt.Errorf("failed to create contract record: %v", err)
	}
	return nil
}

func (pr *PayrollRepository) GetContractRecordsByUserID(userID uint) ([]*models.Contract, error) {
	var contracts []*models.Contract
	if err := orm.DB.Where("user_id = ?", userID).Find(&contracts).Error; err != nil {
		return nil, fmt.Errorf("failed to find contract records by user ID: %v", err)
	}
	return contracts, nil
}

func (pr *PayrollRepository) UpdateContractRecordByUserID(contract *models.Contract) error {
	if err := orm.DB.Model(&models.Contract{}).Where("user_id = ?", contract.UserID).Updates(contract).Error; err != nil {
		return fmt.Errorf("failed to update contract record by user ID: %v", err)
	}
	return nil
}

func (pr *PayrollRepository) DeleteContractRecordByUserID(userID uint) error {
	if err := orm.DB.Where("user_id = ?", userID).Delete(&models.Contract{}).Error; err != nil {
		return fmt.Errorf("failed to delete contract record by user ID: %v", err)
	}
	return nil
}
