package controller

import (
	"back/internal/service"
	"github.com/gin-gonic/gin"
	"log"
	"net/http"
	"strconv"
)

type DepartmentController struct {
	departmentService *service.DepartmentService
}

func NewDepartmentController(departmentService *service.DepartmentService) *DepartmentController {
	return &DepartmentController{
		departmentService: departmentService,
	}
}

func (dc *DepartmentController) CreateDepartment(c *gin.Context) {
	var departmentCreateRequest struct {
		Name         string `json:"name"`
		SupervisorID uint   `json:"supervisorId"`
	}

	if err := c.ShouldBindJSON(&departmentCreateRequest); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"data":   nil,
			"status": "error",
			"message": gin.H{
				"error": err.Error(),
				"msg":   "Invalid request body",
			},
		})
		return
	}

	department, err := dc.departmentService.CreateDepartment(departmentCreateRequest.Name, departmentCreateRequest.SupervisorID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"data":   nil,
			"status": "error",
			"message": gin.H{
				"error": err.Error(),
				"msg":   "Failed to create department",
			},
		})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"data":   department,
		"status": "success",
		"message": gin.H{
			"error": "",
			"msg":   "Department created successfully",
		},
	})
}

func (dc *DepartmentController) GetDepartmentByID(c *gin.Context) {
	departmentID, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"data":   nil,
			"status": "error",
			"message": gin.H{
				"error": err.Error(),
				"msg":   "Invalid department ID",
			},
		})
		return
	}

	department, err := dc.departmentService.GetDepartmentByID(uint(departmentID))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"data":   nil,
			"status": "error",
			"message": gin.H{
				"error": err.Error(),
				"msg":   "Department not found",
			},
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data":   department,
		"status": "success",
		"message": gin.H{
			"error": "",
			"msg":   "Department retrieved successfully",
		},
	})
}

func (dc *DepartmentController) UpdateDepartment(c *gin.Context) {
	departmentID, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		log.Printf("Invalid department ID: %v", c.Param("id"))
		c.JSON(http.StatusBadRequest, gin.H{
			"data":   nil,
			"status": "error",
			"message": gin.H{
				"error": err.Error(),
				"msg":   "Invalid department ID",
			},
		})
		return
	}

	var departmentUpdateRequest struct {
		Name         string `json:"name"`
		SupervisorID uint   `json:"supervisorId"`
	}

	if err := c.ShouldBindJSON(&departmentUpdateRequest); err != nil {
		log.Printf("Invalid request body: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{
			"data":   nil,
			"status": "error",
			"message": gin.H{
				"error": err.Error(),
				"msg":   "Invalid request body",
			},
		})
		return
	}

	err = dc.departmentService.UpdateDepartment(uint(departmentID), departmentUpdateRequest.Name, departmentUpdateRequest.SupervisorID)
	if err != nil {
		log.Printf("Failed to update department: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{
			"data":   nil,
			"status": "error",
			"message": gin.H{
				"error": err.Error(),
				"msg":   "Failed to update department",
			},
		})
		return
	}

	log.Printf("Department updated successfully: ID %d", departmentID)
	c.JSON(http.StatusOK, gin.H{
		"data":   nil,
		"status": "success",
		"message": gin.H{
			"error": "",
			"msg":   "Department updated successfully",
		},
	})
}

func (dc *DepartmentController) DeleteDepartment(c *gin.Context) {
	departmentID, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"data":   nil,
			"status": "error",
			"message": gin.H{
				"error": err.Error(),
				"msg":   "Invalid department ID",
			},
		})
		return
	}

	err = dc.departmentService.DeleteDepartment(uint(departmentID))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"data":   nil,
			"status": "error",
			"message": gin.H{
				"error": err.Error(),
				"msg":   "Failed to delete department",
			},
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data":   nil,
		"status": "success",
		"message": gin.H{
			"error": "",
			"msg":   "Department deleted successfully",
		},
	})
}
