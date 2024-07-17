package controller

import (
	model "back/internal/model"
	"back/internal/service"
	"github.com/gin-gonic/gin"
	"net/http"
	"strconv"
)

type ProjectController struct {
	projectService *service.ProjectService
}

func NewProjectController(projectService *service.ProjectService) *ProjectController {
	return &ProjectController{
		projectService: projectService,
	}
}

func (pc *ProjectController) CreateProject(c *gin.Context) {
	var project model.Project
	if err := c.ShouldBindJSON(&project); err != nil {
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

	if err := pc.projectService.CreateProject(&project); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"data":   nil,
			"status": "error",
			"message": gin.H{
				"error": err.Error(),
				"msg":   "Failed to create project",
			},
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data":   project,
		"status": "success",
		"message": gin.H{
			"error": "",
			"msg":   "Project created successfully",
		},
	})
}

func (pc *ProjectController) GetProjectByID(c *gin.Context) {
	projectID, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"data":   nil,
			"status": "error",
			"message": gin.H{
				"error": err.Error(),
				"msg":   "Invalid project ID",
			},
		})
		return
	}

	project, err := pc.projectService.GetProjectByID(uint(projectID))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"data":   nil,
			"status": "error",
			"message": gin.H{
				"error": err.Error(),
				"msg":   "Failed to retrieve project",
			},
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data":   project,
		"status": "success",
		"message": gin.H{
			"error": "",
			"msg":   "Project retrieved successfully",
		},
	})
}

func (pc *ProjectController) UpdateProject(c *gin.Context) {
	projectID, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"data":   nil,
			"status": "error",
			"message": gin.H{
				"error": err.Error(),
				"msg":   "Invalid project ID",
			},
		})
		return
	}

	var updatedProject model.Project
	if err := c.ShouldBindJSON(&updatedProject); err != nil {
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

	if err := pc.projectService.UpdateProject(uint(projectID), &updatedProject); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"data":   nil,
			"status": "error",
			"message": gin.H{
				"error": err.Error(),
				"msg":   "Failed to update project",
			},
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data":   updatedProject,
		"status": "success",
		"message": gin.H{
			"error": "",
			"msg":   "Project updated successfully",
		},
	})
}

func (pc *ProjectController) DeleteProject(c *gin.Context) {
	projectID, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"data":   nil,
			"status": "error",
			"message": gin.H{
				"error": err.Error(),
				"msg":   "Invalid project ID",
			},
		})
		return
	}

	if err := pc.projectService.DeleteProject(uint(projectID)); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"data":   nil,
			"status": "error",
			"message": gin.H{
				"error": err.Error(),
				"msg":   "Failed to delete project",
			},
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data":   nil,
		"status": "success",
		"message": gin.H{
			"error": "",
			"msg":   "Project deleted successfully",
		},
	})
}

func (pc *ProjectController) GetProjectsByUserID(c *gin.Context) {
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

	projects, err := pc.projectService.GetProjectsByUserID(uint(userID))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"data":   nil,
			"status": "error",
			"message": gin.H{
				"error": err.Error(),
				"msg":   "Failed to retrieve projects",
			},
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data":   projects,
		"status": "success",
		"message": gin.H{
			"error": "",
			"msg":   "Projects retrieved successfully",
		},
	})
}

func (pc *ProjectController) AddUserToProject(c *gin.Context) {
	projectID, err := strconv.ParseUint(c.Param("projectId"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"data":   nil,
			"status": "error",
			"message": gin.H{
				"error": err.Error(),
				"msg":   "Invalid project ID",
			},
		})
		return
	}

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

	if err := pc.projectService.AddUserToProject(uint(projectID), uint(userID)); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"data":   nil,
			"status": "error",
			"message": gin.H{
				"error": err.Error(),
				"msg":   "Failed to add user to project",
			},
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data":   nil,
		"status": "success",
		"message": gin.H{
			"error": "",
			"msg":   "User added to project successfully",
		},
	})
}

func (pc *ProjectController) RemoveUserFromProject(c *gin.Context) {
	projectID, err := strconv.ParseUint(c.Param("projectId"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"data":   nil,
			"status": "error",
			"message": gin.H{
				"error": err.Error(),
				"msg":   "Invalid project ID",
			},
		})
		return
	}

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

	if err := pc.projectService.RemoveUserFromProject(uint(projectID), uint(userID)); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"data":   nil,
			"status": "error",
			"message": gin.H{
				"error": err.Error(),
				"msg":   "Failed to remove user from project",
			},
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data":   nil,
		"status": "success",
		"message": gin.H{
			"error": "",
			"msg":   "User removed from project successfully",
		},
	})
}

func (pc *ProjectController) GetManagersByProjectID(c *gin.Context) {
	projectID, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"data":   nil,
			"status": "error",
			"message": gin.H{
				"error": err.Error(),
				"msg":   "Invalid project ID",
			},
		})
		return
	}

	managers, err := pc.projectService.GetManagersByProjectID(uint(projectID))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"data":   nil,
			"status": "error",
			"message": gin.H{
				"error": err.Error(),
				"msg":   "Failed to retrieve managers",
			},
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data":   managers,
		"status": "success",
		"message": gin.H{
			"error": "",
			"msg":   "Managers retrieved successfully",
		},
	})
}

func (pc *ProjectController) GetUsersByProjectID(c *gin.Context) {
	projectID, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"data":   nil,
			"status": "error",
			"message": gin.H{
				"error": err.Error(),
				"msg":   "Invalid project ID",
			},
		})
		return
	}

	users, err := pc.projectService.GetUsersByProjectID(uint(projectID))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"data":   nil,
			"status": "error",
			"message": gin.H{
				"error": err.Error(),
				"msg":   "Failed to retrieve users",
			},
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data":   users,
		"status": "success",
		"message": gin.H{
			"error": "",
			"msg":   "Users retrieved successfully",
		},
	})
}

func (pc *ProjectController) AddManagerToProject(c *gin.Context) {
	projectID, err := strconv.ParseUint(c.Param("projectId"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"data":   nil,
			"status": "error",
			"message": gin.H{
				"error": err.Error(),
				"msg":   "Invalid project ID",
			},
		})
		return
	}

	managerID, err := strconv.ParseUint(c.Param("managerId"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"data":   nil,
			"status": "error",
			"message": gin.H{
				"error": err.Error(),
				"msg":   "Invalid manager ID",
			},
		})
		return
	}

	if err := pc.projectService.AddManagerToProject(uint(projectID), uint(managerID)); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"data":   nil,
			"status": "error",
			"message": gin.H{
				"error": err.Error(),
				"msg":   "Failed to add manager to project",
			},
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data":   nil,
		"status": "success",
		"message": gin.H{
			"error": "",
			"msg":   "Manager added to project successfully",
		},
	})
}

func (pc *ProjectController) RemoveManagerFromProject(c *gin.Context) {
	projectID, err := strconv.ParseUint(c.Param("projectId"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"data":   nil,
			"status": "error",
			"message": gin.H{
				"error": err.Error(),
				"msg":   "Invalid project ID",
			},
		})
		return
	}

	managerID, err := strconv.ParseUint(c.Param("managerId"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"data":   nil,
			"status": "error",
			"message": gin.H{
				"error": err.Error(),
				"msg":   "Invalid manager ID",
			},
		})
		return
	}

	if err := pc.projectService.RemoveManagerFromProject(uint(projectID), uint(managerID)); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"data":   nil,
			"status": "error",
			"message": gin.H{
				"error": err.Error(),
				"msg":   "Failed to remove manager from project",
			},
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data":   nil,
		"status": "success",
		"message": gin.H{
			"error": "",
			"msg":   "Manager removed from project successfully",
		},
	})
}
