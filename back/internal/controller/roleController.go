package controller

import (
	"back/internal/service"
	"github.com/gin-gonic/gin"
	"net/http"
)

type RoleController struct {
	roleService *service.RoleService
}

func NewRoleController(roleService *service.RoleService) *RoleController {
	return &RoleController{
		roleService: roleService,
	}
}

func (rc *RoleController) CreateRole(c *gin.Context) {
	var body struct {
		Name string `json:"name"`
	}
	if err := c.Bind(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}
	role, err := rc.roleService.CreateRole(body.Name)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error creating role"})
		return
	}
	c.JSON(http.StatusOK, role)
}

func (rc *RoleController) CreatePermission(c *gin.Context) {
	var body struct {
		Name        string `json:"name"`
		Description string `json:"description"`
	}
	if err := c.Bind(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}
	permission, err := rc.roleService.CreatePermission(body.Name, body.Description)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error creating permission"})
		return
	}
	c.JSON(http.StatusOK, permission)
}

func (rc *RoleController) CreateRolePermission(c *gin.Context) {
	var body struct {
		RoleID       uint `json:"roleId"`
		PermissionID uint `json:"permissionId"`
	}
	if err := c.Bind(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}
	rolePermission, err := rc.roleService.CreateRolePermission(body.RoleID, body.PermissionID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error creating role permission"})
		return
	}
	c.JSON(http.StatusOK, rolePermission)
}
