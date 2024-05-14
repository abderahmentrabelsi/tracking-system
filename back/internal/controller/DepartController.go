package controller

import (
	"back/internal/service"
	"fmt"
	"github.com/gin-gonic/gin"
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
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}

	department, err := dc.departmentService.CreateDepartment(departmentCreateRequest.Name, departmentCreateRequest.SupervisorID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to create department: %v", err)})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"department": department})
}

func (dc *DepartmentController) GetDepartmentByID(c *gin.Context) {
	departmentID, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid department ID"})
		return
	}

	department, err := dc.departmentService.GetDepartmentByID(uint(departmentID))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": fmt.Sprintf("Department not found: %v", err)})
		return
	}

	c.JSON(http.StatusOK, gin.H{"department": department})
}

func (dc *DepartmentController) UpdateDepartment(c *gin.Context) {
	departmentID, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid department ID"})
		return
	}

	var departmentUpdateRequest struct {
		Name         string `json:"name"`
		SupervisorID uint   `json:"supervisorId"`
	}

	if err := c.ShouldBindJSON(&departmentUpdateRequest); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}

	err = dc.departmentService.UpdateDepartment(uint(departmentID), departmentUpdateRequest.Name, departmentUpdateRequest.SupervisorID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to update department: %v", err)})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Department updated successfully"})
}

func (dc *DepartmentController) DeleteDepartment(c *gin.Context) {
	departmentID, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid department ID"})
		return
	}

	err = dc.departmentService.DeleteDepartment(uint(departmentID))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Failed to delete department: %v", err)})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Department deleted successfully"})
}
