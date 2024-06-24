package controller

import (
	"back/internal/model"
	"back/internal/service"
	"github.com/gin-gonic/gin"
	"net/http"
	"strconv"
)

type CalendarController struct {
	calendarService *service.CalendarService
}

func NewCalendarController(calendarService *service.CalendarService) *CalendarController {
	return &CalendarController{calendarService: calendarService}
}

func (cc *CalendarController) CreateCalendar(c *gin.Context) {
	var calendar models.Calendar
	if err := c.ShouldBindJSON(&calendar); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"data":    nil,
			"status":  "error",
			"message": "Invalid request body",
			"error":   err.Error(),
		})
		return
	}
	if err := cc.calendarService.CreateCalendar(&calendar); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"data":    nil,
			"status":  "error",
			"message": "Failed to create calendar",
			"error":   err.Error(),
		})
		return
	}
	c.JSON(http.StatusCreated, gin.H{
		"data":    calendar,
		"status":  "success",
		"message": "Calendar created successfully",
	})
}
func (cc *CalendarController) GetCalendarByID(c *gin.Context) {
	calendarID, err := strconv.ParseUint(c.Param("calendar_id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"status":  "error",
			"message": "Invalid calendar ID",
			"error":   err.Error(),
		})
		return
	}

	calendar, err := cc.calendarService.GetCalendarByID(uint(calendarID))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"status":  "error",
			"message": "Calendar not found",
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"status":  "success",
		"message": "Calendar retrieved successfully",
		"data":    calendar,
	})
}
func (cc *CalendarController) UpdateCalendar(c *gin.Context) {
	calendarID, err := strconv.ParseUint(c.Param("calendar_id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"status":  "error",
			"message": "Invalid calendar ID",
		})
		return
	}

	var updatedCalendar models.Calendar
	if err := c.ShouldBindJSON(&updatedCalendar); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"status":  "error",
			"message": "Invalid request body",
			"error":   err.Error(),
		})
		return
	}

	// Call the service layer to update the calendar
	if err := cc.calendarService.UpdateCalendar(uint(calendarID), &updatedCalendar); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"status":  "error",
			"message": "Failed to update calendar",
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data":    updatedCalendar,
		"status":  "success",
		"message": "Calendar updated successfully",
	})
}
func (cc *CalendarController) DeleteCalendar(c *gin.Context) {
	calendarID, err := strconv.ParseUint(c.Param("calendar_id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"status":  "error",
			"message": "Invalid calendar ID",
		})
		return
	}

	if err := cc.calendarService.DeleteCalendar(uint(calendarID)); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"status":  "error",
			"message": "Failed to delete calendar",
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"status":  "success",
		"message": "Calendar deleted successfully",
	})
}
func (cc *CalendarController) CreateEvent(c *gin.Context) {
	var event models.CalendarEvent
	if err := c.ShouldBindJSON(&event); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"data":    nil,
			"status":  "error",
			"message": "Invalid request body",
			"error":   err.Error(),
		})
		return
	}
	if err := cc.calendarService.CreateEvent(&event); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"data":    nil,
			"status":  "error",
			"message": "Failed to create event",
			"error":   err.Error(),
		})
		return
	}
	c.JSON(http.StatusCreated, gin.H{
		"data":    event,
		"status":  "success",
		"message": "Event created successfully",
	})
}
func (cc *CalendarController) GetEventByID(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("event_id"), 10, 32)
	event, err := cc.calendarService.GetEventByID(uint(id))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"data":    nil,
			"status":  "error",
			"message": "Event not found",
			"error":   err.Error(),
		})
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"data":    event,
		"status":  "success",
		"message": "Event retrieved successfully",
	})
}
func (cc *CalendarController) UpdateEvent(c *gin.Context) {
	eventID, err := strconv.ParseUint(c.Param("event_id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"status":  "error",
			"message": "Invalid event ID",
		})
		return
	}

	var updatedEvent models.CalendarEvent
	if err := c.ShouldBindJSON(&updatedEvent); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"status":  "error",
			"message": "Invalid request body",
			"error":   err.Error(),
		})
		return
	}
	if err := cc.calendarService.UpdateEvent(uint(eventID), &updatedEvent); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"status":  "error",
			"message": "Failed to update event",
			"error":   err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data":    updatedEvent,
		"status":  "success",
		"message": "Event updated successfully",
	})
}
func (cc *CalendarController) DeleteEvent(c *gin.Context) {
	id, _ := strconv.ParseUint(c.Param("event_id"), 10, 32)
	if err := cc.calendarService.DeleteEvent(uint(id)); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"data":    nil,
			"status":  "error",
			"message": "Failed to delete event",
			"error":   err.Error(),
		})
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"data":    nil,
		"status":  "success",
		"message": "Event deleted successfully",
	})
}
func (cc *CalendarController) GetEventsByCalendarID(c *gin.Context) {
	calendarID, _ := strconv.ParseUint(c.Param("calendar_id"), 10, 32)
	events, err := cc.calendarService.GetEventsByCalendarID(uint(calendarID))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"data":    nil,
			"status":  "error",
			"message": "Failed to fetch events",
			"error":   err.Error(),
		})
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"data":    events,
		"status":  "success",
		"message": "Events retrieved successfully",
	})
}
func (cc *CalendarController) GetEventsByDepartmentID(c *gin.Context) {
	departmentID, _ := strconv.ParseUint(c.Param("department_id"), 10, 32)
	events, err := cc.calendarService.GetEventsByDepartmentID(uint(departmentID))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"data":    nil,
			"status":  "error",
			"message": "Failed to fetch events",
			"error":   err.Error(),
		})
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"data":    events,
		"status":  "success",
		"message": "Events retrieved successfully",
	})
}
func (cc *CalendarController) GetCalendarByDepartmentID(c *gin.Context) {
	departmentID, _ := strconv.ParseUint(c.Param("department_id"), 10, 32)
	calendar, err := cc.calendarService.GetCalendarByDepartmentID(uint(departmentID))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"data":    nil,
			"status":  "error",
			"message": "Calendar not found",
			"error":   err.Error(),
		})
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"data":    calendar,
		"status":  "success",
		"message": "Calendar retrieved successfully",
	})
}
