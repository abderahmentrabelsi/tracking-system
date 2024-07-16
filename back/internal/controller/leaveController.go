package controller

import (
	model "back/internal/model"
	"back/internal/service"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

type LeaveController struct {
	leaveService *service.LeaveService
}

func NewLeaveController(leaveService *service.LeaveService) *LeaveController {
	return &LeaveController{
		leaveService: leaveService,
	}
}

func (lc *LeaveController) CreateLeaveRequest(c *gin.Context) {
	var leaveRequest model.LeaveRequest

	if err := c.ShouldBindJSON(&leaveRequest); err != nil {
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

	if err := lc.leaveService.CreateLeaveRequest(&leaveRequest); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"data":   nil,
			"status": "error",
			"message": gin.H{
				"msg":   "Failed to create leave request",
				"error": err.Error(),
			},
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data":   leaveRequest,
		"status": "success",
		"message": gin.H{
			"msg": "Leave request created successfully",
		},
	})
}

func (lc *LeaveController) ApproveLeaveRequest(c *gin.Context) {
	var body struct {
		Approve        bool   `json:"approve"`
		ManagerComment string `json:"managerComment"`
	}

	if err := c.ShouldBindJSON(&body); err != nil {
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

	leaveRequestID, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"data":   nil,
			"status": "error",
			"message": gin.H{
				"msg":   "Invalid leave request ID",
				"error": err.Error(),
			},
		})
		return
	}

	if err := lc.leaveService.ApproveLeaveRequest(uint(leaveRequestID), body.Approve, body.ManagerComment); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"data":   nil,
			"status": "error",
			"message": gin.H{
				"msg":   "Failed to update leave request",
				"error": err.Error(),
			},
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data":   nil,
		"status": "success",
		"message": gin.H{
			"msg": "Leave request updated successfully",
		},
	})
}

func (lc *LeaveController) GetLeaveRequests(c *gin.Context) {
	userID, err := strconv.ParseUint(c.Param("userId"), 10, 64)
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

	leaveRequests, err := lc.leaveService.GetLeaveRequests(uint(userID))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"data":   nil,
			"status": "error",
			"message": gin.H{
				"msg":   "Failed to retrieve leave requests",
				"error": err.Error(),
			},
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data":   leaveRequests,
		"status": "success",
		"message": gin.H{
			"msg": "Leave requests retrieved successfully",
		},
	})
}

func (lc *LeaveController) DeleteLeaveRequest(c *gin.Context) {
	leaveRequestID, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"data":   nil,
			"status": "error",
			"message": gin.H{
				"msg":   "Invalid leave request ID",
				"error": err.Error(),
			},
		})
		return
	}

	if err := lc.leaveService.DeleteLeaveRequest(uint(leaveRequestID)); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"data":   nil,
			"status": "error",
			"message": gin.H{
				"msg":   "Failed to delete leave request",
				"error": err.Error(),
			},
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data":   nil,
		"status": "success",
		"message": gin.H{
			"msg": "Leave request deleted successfully",
		},
	})
}
