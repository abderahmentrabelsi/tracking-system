package repository

import (
	"back/internal/model"
	"back/internal/orm"
)

type CalendarRepository struct{}

func NewCalendarRepository() *CalendarRepository {
	return &CalendarRepository{}
}

func (r *CalendarRepository) CreateCalendar(calendar *models.Calendar) error {
	return orm.DB.Create(calendar).Error
}
func (r *CalendarRepository) GetCalendarByID(id uint) (*models.Calendar, error) {
	var calendar models.Calendar
	err := orm.DB.Preload("Events").Preload("Department").First(&calendar, id).Error
	return &calendar, err
}
func (r *CalendarRepository) UpdateCalendar(id uint, updatedCalendar *models.Calendar) error {
	existingCalendar, err := r.GetCalendarByID(id)
	if err != nil {
		return err
	}

	// Update fields from updatedCalendar
	existingCalendar.Name = updatedCalendar.Name
	existingCalendar.Location = updatedCalendar.Location
	existingCalendar.Active = updatedCalendar.Active
	existingCalendar.Color = updatedCalendar.Color
	existingCalendar.Overlap = updatedCalendar.Overlap
	existingCalendar.Attributes = updatedCalendar.Attributes
	existingCalendar.ImageURL = updatedCalendar.ImageURL
	existingCalendar.DepartmentID = updatedCalendar.DepartmentID
	existingCalendar.CreatedByID = updatedCalendar.CreatedByID

	if err := orm.DB.Save(existingCalendar).Error; err != nil {
		return err
	}

	return nil
}
func (r *CalendarRepository) DeleteCalendar(id uint) error {
	var calendar models.Calendar
	result := orm.DB.First(&calendar, id)
	if result.Error != nil {
		return result.Error
	}
	if err := orm.DB.Delete(&calendar).Error; err != nil {
		return err
	}
	return nil
}
func (r *CalendarRepository) CreateEvent(event *models.CalendarEvent) error {
	return orm.DB.Create(event).Error
}
func (r *CalendarRepository) GetEventByID(id uint) (*models.CalendarEvent, error) {
	var event models.CalendarEvent
	err := orm.DB.Preload("Calendar").Preload("Department").First(&event, id).Error
	return &event, err
}
func (r *CalendarRepository) UpdateEvent(id uint, updatedEvent *models.CalendarEvent) error {
	existingEvent, err := r.GetEventByID(id)
	if err != nil {
		return err
	}
	existingEvent.StartDT = updatedEvent.StartDT
	existingEvent.EndDT = updatedEvent.EndDT
	existingEvent.AllDay = updatedEvent.AllDay
	existingEvent.Title = updatedEvent.Title
	existingEvent.Who = updatedEvent.Who
	existingEvent.Location = updatedEvent.Location
	existingEvent.Notes = updatedEvent.Notes
	existingEvent.IsRemote = updatedEvent.IsRemote
	existingEvent.Attendance = updatedEvent.Attendance
	existingEvent.CalendarID = updatedEvent.CalendarID
	existingEvent.Version = updatedEvent.Version
	existingEvent.DepartmentID = updatedEvent.DepartmentID

	if err := orm.DB.Save(existingEvent).Error; err != nil {
		return err
	}

	return nil
}
func (r *CalendarRepository) DeleteEvent(id uint) error {
	return orm.DB.Delete(&models.CalendarEvent{}, id).Error
}
func (r *CalendarRepository) GetEventsByCalendarID(calendarID uint) ([]models.CalendarEvent, error) {
	var events []models.CalendarEvent
	err := orm.DB.Where("calendar_id = ?", calendarID).Find(&events).Error
	return events, err
}
func (r *CalendarRepository) GetEventsByDepartmentID(departmentID uint) ([]models.CalendarEvent, error) {
	var events []models.CalendarEvent
	err := orm.DB.Where("department_id = ?", departmentID).Preload("Calendar").Preload("Department").Find(&events).Error
	if err != nil {
		return nil, err
	}
	return events, nil
}
