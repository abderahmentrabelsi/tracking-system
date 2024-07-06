package controller

import (
	"back/internal/service"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
)

type TimesheetController struct {
	workHoursService *service.WorkHoursService
}

func NewTimesheetController(workHoursService *service.WorkHoursService) *TimesheetController {
	return &TimesheetController{
		workHoursService: workHoursService,
	}
}

func (tc *TimesheetController) CheckIn(c *gin.Context) {
	var body struct {
		UserID   uint   `json:"userID"`
		TaskID   *uint  `json:"taskID,omitempty"`
		WorkType string `json:"workType"`
		Location string `json:"location"`
		Comments string `json:"comments"`
	}

	if err := c.Bind(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"data":   nil,
			"status": "error",
			"message": gin.H{
				"msg":   "Invalid request body",
				"error": err.Error(),
			},
		})
		return
	}

	workHours, err := tc.workHoursService.CheckIn(body.UserID, body.WorkType, body.Location, body.Comments, body.TaskID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"data":   nil,
			"status": "error",
			"message": gin.H{
				"msg":   "Error checking in",
				"error": err.Error(),
			},
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data":   workHours,
		"status": "success",
		"message": gin.H{
			"msg": "Checked in successfully",
		},
	})
}

func (tc *TimesheetController) CheckOut(c *gin.Context) {
	workHoursID, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"data":   nil,
			"status": "error",
			"message": gin.H{
				"msg":   "Invalid work hours ID",
				"error": err.Error(),
			},
		})
		return
	}

	workHours, err := tc.workHoursService.CheckOut(uint(workHoursID))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"data":   nil,
			"status": "error",
			"message": gin.H{
				"msg":   "Error checking out",
				"error": err.Error(),
			},
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data":   workHours,
		"status": "success",
		"message": gin.H{
			"msg": "Checked out successfully",
		},
	})
}

func (tc *TimesheetController) GetTimesheet(c *gin.Context) {
	userID, err := strconv.ParseUint(c.Param("userID"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"data":   nil,
			"status": "error",
			"message": gin.H{
				"msg":   "Invalid user ID",
				"error": err.Error(),
			},
		})
		return
	}

	workHours, err := tc.workHoursService.GetTimesheet(uint(userID))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"data":   nil,
			"status": "error",
			"message": gin.H{
				"msg":   "Error retrieving timesheet",
				"error": err.Error(),
			},
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data":   workHours,
		"status": "success",
		"message": gin.H{
			"msg": "Timesheet retrieved successfully",
		},
	})
}

func (tc *TimesheetController) RequestEdit(c *gin.Context) {
	var body struct {
		WorkHoursID    uint   `json:"workHoursID"`
		EditRequestMsg string `json:"editRequestMsg"`
	}

	if err := c.Bind(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"data":   nil,
			"status": "error",
			"message": gin.H{
				"msg":   "Invalid request body",
				"error": err.Error(),
			},
		})
		return
	}

	workHours, err := tc.workHoursService.RequestEdit(body.WorkHoursID, body.EditRequestMsg)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"data":   nil,
			"status": "error",
			"message": gin.H{
				"msg":   "Error requesting edit",
				"error": err.Error(),
			},
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data":   workHours,
		"status": "success",
		"message": gin.H{
			"msg": "Edit requested successfully",
		},
	})
}

func (tc *TimesheetController) ApproveEdit(c *gin.Context) {
	var body struct {
		WorkHoursID    uint   `json:"workHoursID"`
		Approved       bool   `json:"approved"`
		ManagerComment string `json:"managerComment"`
	}

	if err := c.Bind(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"data":   nil,
			"status": "error",
			"message": gin.H{
				"msg":   "Invalid request body",
				"error": err.Error(),
			},
		})
		return
	}

	workHours, err := tc.workHoursService.ApproveEdit(body.WorkHoursID, body.Approved, body.ManagerComment)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"data":   nil,
			"status": "error",
			"message": gin.H{
				"msg":   "Error approving edit",
				"error": err.Error(),
			},
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data":   workHours,
		"status": "success",
		"message": gin.H{
			"msg": "Edit approved successfully",
		},
	})
}

func (tc *TimesheetController) GetTimesheetByDateRange(c *gin.Context) {
	var body struct {
		StartDate string `json:"startDate"`
		EndDate   string `json:"endDate"`
	}

	if err := c.Bind(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"data":   nil,
			"status": "error",
			"message": gin.H{
				"msg":   "Invalid request body",
				"error": err.Error(),
			},
		})
		return
	}

	startDate, err := time.Parse("2006-01-02", body.StartDate)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"data":   nil,
			"status": "error",
			"message": gin.H{
				"msg":   "Invalid start date format",
				"error": err.Error(),
			},
		})
		return
	}

	endDate, err := time.Parse("2006-01-02", body.EndDate)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"data":   nil,
			"status": "error",
			"message": gin.H{
				"msg":   "Invalid end date format",
				"error": err.Error(),
			},
		})
		return
	}

	workHours, err := tc.workHoursService.GetTimesheetByDateRange(startDate, endDate)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"data":   nil,
			"status": "error",
			"message": gin.H{
				"msg":   "Error retrieving timesheet",
				"error": err.Error(),
			},
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data":   workHours,
		"status": "success",
		"message": gin.H{
			"msg": "Timesheet retrieved successfully",
		},
	})
}
