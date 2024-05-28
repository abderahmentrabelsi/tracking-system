package controller

import (
	models "back/internal/model"
	"back/internal/service"
	"github.com/gin-gonic/gin"
	"net/http"
	"strconv"
)

type PayrollController struct {
	payrollService *service.PayrollService
}

func NewPayrollController(payrollService *service.PayrollService) *PayrollController {
	return &PayrollController{
		payrollService: payrollService,
	}
}

// Salary Record

func (pc *PayrollController) CreateSalaryRecord(c *gin.Context) {
	var salary models.Salary
	if err := c.BindJSON(&salary); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"data":   nil,
			"status": "error",
			"message": gin.H{
				"error": err.Error(),
				"msg":   "Invalid request payload",
			},
		})
		return
	}

	if err := pc.payrollService.CreateSalaryRecord(&salary); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"data":   nil,
			"status": "error",
			"message": gin.H{
				"error": err.Error(),
				"msg":   "Failed to create salary record",
			},
		})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"data":   salary,
		"status": "success",
		"message": gin.H{
			"error": "",
			"msg":   "Salary record created successfully",
		},
	})
}

func (pc *PayrollController) UpdateSalaryRecordByUserID(c *gin.Context) {
	userID, err := strconv.ParseUint(c.Param("userId"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"data":   nil,
			"status": "error",
			"message": gin.H{
				"error": err.Error(),
				"msg":   "Invalid user ID",
			},
		})
		return
	}

	var salary models.Salary
	if err := c.BindJSON(&salary); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"data":   nil,
			"status": "error",
			"message": gin.H{
				"error": err.Error(),
				"msg":   "Invalid request payload",
			},
		})
		return
	}
	salary.UserID = uint(userID)

	if err := pc.payrollService.UpdateSalaryRecordByUserID(&salary); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"data":   nil,
			"status": "error",
			"message": gin.H{
				"error": err.Error(),
				"msg":   "Failed to update salary record",
			},
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data":   salary,
		"status": "success",
		"message": gin.H{
			"error": "",
			"msg":   "Salary record updated successfully",
		},
	})
}

func (pc *PayrollController) GetSalaryRecordsByUserID(c *gin.Context) {
	userID, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"data":   nil,
			"status": "error",
			"message": gin.H{
				"error": err.Error(),
				"msg":   "Invalid user ID",
			},
		})
		return
	}

	salaries, err := pc.payrollService.GetSalaryRecordsByUserID(uint(userID))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"data":   nil,
			"status": "error",
			"message": gin.H{
				"error": err.Error(),
				"msg":   "Failed to get salary records",
			},
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data":   salaries,
		"status": "success",
		"message": gin.H{
			"error": "",
			"msg":   "Salary records retrieved successfully",
		},
	})
}

func (pc *PayrollController) DeleteSalaryRecordByUserID(c *gin.Context) {
	userID, err := strconv.ParseUint(c.Param("userId"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"data":   nil,
			"status": "error",
			"message": gin.H{
				"error": err.Error(),
				"msg":   "Invalid user ID",
			},
		})
		return
	}

	if err := pc.payrollService.DeleteSalaryRecordByUserID(uint(userID)); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"data":   nil,
			"status": "error",
			"message": gin.H{
				"error": err.Error(),
				"msg":   "Failed to delete salary record",
			},
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data":   nil,
		"status": "success",
		"message": gin.H{
			"error": "",
			"msg":   "Salary record deleted successfully",
		},
	})
}

// Contract Record

func (pc *PayrollController) CreateContractRecord(c *gin.Context) {
	var contract models.Contract
	if err := c.BindJSON(&contract); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"data":   nil,
			"status": "error",
			"message": gin.H{
				"error": err.Error(),
				"msg":   "Invalid request payload",
			},
		})
		return
	}

	if err := pc.payrollService.CreateContractRecord(&contract); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"data":   nil,
			"status": "error",
			"message": gin.H{
				"error": err.Error(),
				"msg":   "Failed to create contract record",
			},
		})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"data":   contract,
		"status": "success",
		"message": gin.H{
			"error": "",
			"msg":   "contract record created successfully",
		},
	})
}

func (pc *PayrollController) GetContractByUserID(c *gin.Context) {
	userID, err := strconv.ParseUint(c.Param("userId"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"data":   nil,
			"status": "error",
			"message": gin.H{
				"error": err.Error(),
				"msg":   "Invalid user ID",
			},
		})
		return
	}

	contract, err := pc.payrollService.GetContractRecordsByUserID(uint(userID))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"data":   nil,
			"status": "error",
			"message": gin.H{
				"error": err.Error(),
				"msg":   "Failed to get contract",
			},
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data":   contract,
		"status": "success",
		"message": gin.H{
			"error": "",
			"msg":   "Contract retrieved successfully",
		},
	})
}

func (pc *PayrollController) UpdateContractByUserID(c *gin.Context) {
	userID, err := strconv.ParseUint(c.Param("userId"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"data":   nil,
			"status": "error",
			"message": gin.H{
				"error": err.Error(),
				"msg":   "Invalid user ID",
			},
		})
		return
	}

	var contract models.Contract
	if err := c.BindJSON(&contract); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"data":   nil,
			"status": "error",
			"message": gin.H{
				"error": err.Error(),
				"msg":   "Invalid request payload",
			},
		})
		return
	}
	contract.UserID = uint(userID)

	if err := pc.payrollService.UpdateContractRecordByUserID(&contract); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"data":   nil,
			"status": "error",
			"message": gin.H{
				"error": err.Error(),
				"msg":   "Failed to update contract",
			},
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data":   contract,
		"status": "success",
		"message": gin.H{
			"error": "",
			"msg":   "Contract updated successfully",
		},
	})
}

func (pc *PayrollController) DeleteContractByUserID(c *gin.Context) {
	userID, err := strconv.ParseUint(c.Param("userId"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"data":   nil,
			"status": "error",
			"message": gin.H{
				"error": err.Error(),
				"msg":   "Invalid user ID",
			},
		})
		return
	}

	if err := pc.payrollService.DeleteContractRecordByUserID(uint(userID)); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"data":   nil,
			"status": "error",
			"message": gin.H{
				"error": err.Error(),
				"msg":   "Failed to delete contract",
			},
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data":   nil,
		"status": "success",
		"message": gin.H{
			"error": "",
			"msg":   "Contract deleted successfully",
		},
	})
}
