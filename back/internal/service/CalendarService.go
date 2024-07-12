package service

import (
	"back/internal/model"
	"back/internal/repository"
	"errors"
	"gorm.io/gorm"
)

type CalendarService struct {
	calendarRepo repository.CalendarRepository
}

func NewCalendarService(calendarRepo repository.CalendarRepository) *CalendarService {
	return &CalendarService{calendarRepo: calendarRepo}
}
func (s *CalendarService) CreateCalendar(calendar *models.Calendar) error {
	return s.calendarRepo.CreateCalendar(calendar)
}
func (s *CalendarService) GetCalendarByID(id uint) (*models.Calendar, error) {
	return s.calendarRepo.GetCalendarByID(id)
}
func (s *CalendarService) UpdateCalendar(id uint, calendar *models.Calendar) error {
	return s.calendarRepo.UpdateCalendar(id, calendar)
}
func (s *CalendarService) DeleteCalendar(id uint) error {
	err := s.calendarRepo.DeleteCalendar(id)
	if err != nil {
		return err
	}
	return nil
}
func (s *CalendarService) CreateEvent(event *models.CalendarEvent) error {
	return s.calendarRepo.CreateEvent(event)
}
func (s *CalendarService) GetEventByID(id uint) (*models.CalendarEvent, error) {
	return s.calendarRepo.GetEventByID(id)
}
func (s *CalendarService) UpdateEvent(id uint, event *models.CalendarEvent) error {
	return s.calendarRepo.UpdateEvent(id, event)
}
func (s *CalendarService) DeleteEvent(id uint) error {
	return s.calendarRepo.DeleteEvent(id)
}
func (s *CalendarService) GetEventsByCalendarID(calendarID uint) ([]models.CalendarEvent, error) {
	return s.calendarRepo.GetEventsByCalendarID(calendarID)
}
func (s *CalendarService) GetEventsByDepartmentID(departmentID uint) ([]models.CalendarEvent, error) {
	return s.calendarRepo.GetEventsByDepartmentID(departmentID)
}

func (s *CalendarService) GetCalendarByDepartmentID(departmentID uint) (*models.Calendar, error) {
	calendar, err := s.calendarRepo.GetCalendarByDepartmentID(departmentID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			// Create a new calendar if not found
			newCalendar := &models.Calendar{
				DepartmentID: departmentID,
				Name:         "Default Calendar",
				Location:     "Default Location",
				Active:       true,
				Color:        0xFFFFFF,
			}
			if err := s.calendarRepo.CreateCalendar(newCalendar); err != nil {
				return nil, err
			}
			return newCalendar, nil
		}
		return nil, err
	}
	return calendar, nil
}
