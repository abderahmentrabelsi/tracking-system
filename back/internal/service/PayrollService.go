package service

import (
	"back/internal/model"
	"back/internal/repository"
	"fmt"
)

type PayrollService struct {
	payrollRepository repository.PayrollRepository
}

func NewPayrollService(payrollRepository repository.PayrollRepository) *PayrollService {
	return &PayrollService{
		payrollRepository: payrollRepository,
	}
}

func (ps *PayrollService) CreateSalaryRecord(salary *models.Salary) error {
	return ps.payrollRepository.CreateSalaryRecord(salary)
}

func (ps *PayrollService) GetSalaryRecordsByUserID(userID uint) ([]*models.Salary, error) {
	salaries, err := ps.payrollRepository.GetSalaryRecordsByUserID(userID)
	if err != nil {
		return nil, fmt.Errorf("failed to get salary records by user ID: %v", err)
	}
	return salaries, nil
}

func (ps *PayrollService) UpdateSalaryRecordByUserID(salary *models.Salary) error {
	return ps.payrollRepository.UpdateSalaryRecordByUserID(salary)
}

func (ps *PayrollService) DeleteSalaryRecordByUserID(userID uint) error {
	return ps.payrollRepository.DeleteSalaryRecordByUserID(userID)
}

func (ps *PayrollService) CreateContractRecord(contract *models.Contract) error {
	return ps.payrollRepository.CreateContractRecord(contract)
}

func (ps *PayrollService) GetContractRecordsByUserID(userID uint) ([]*models.Contract, error) {
	contracts, err := ps.payrollRepository.GetContractRecordsByUserID(userID)
	if err != nil {
		return nil, fmt.Errorf("failed to get contract records by user ID: %v", err)
	}
	return contracts, nil
}

func (ps *PayrollService) UpdateContractRecordByUserID(contract *models.Contract) error {
	return ps.payrollRepository.UpdateContractRecordByUserID(contract)
}

func (ps *PayrollService) DeleteContractRecordByUserID(userID uint) error {
	return ps.payrollRepository.DeleteContractRecordByUserID(userID)
}
