package controller

import (
	"back/internal/model"
	"back/internal/service"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

type TaskController struct {
	taskService *service.TaskService
}

func NewTaskController(taskService *service.TaskService) *TaskController {
	return &TaskController{taskService: taskService}
}

func (tc *TaskController) CreateTask(c *gin.Context) {
	var task models.Task
	if err := c.ShouldBindJSON(&task); err != nil {
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
	if err := tc.taskService.CreateTask(&task); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"data":   nil,
			"status": "error",
			"message": gin.H{
				"error": err.Error(),
				"msg":   "Error creating task",
			},
		})
		return
	}
	c.JSON(http.StatusCreated, gin.H{
		"data":   task,
		"status": "success",
		"message": gin.H{
			"error": "",
			"msg":   "Task created successfully",
		},
	})
}
func (tc *TaskController) GetTaskByID(c *gin.Context) {
	taskID, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"data":   nil,
			"status": "error",
			"message": gin.H{
				"error": "Invalid task ID",
				"msg":   "Invalid task ID",
			},
		})
		return
	}
	task, err := tc.taskService.GetTaskByID(uint(taskID))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"data":   nil,
			"status": "error",
			"message": gin.H{
				"error": err.Error(),
				"msg":   "Error retrieving task",
			},
		})
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"data":   task,
		"status": "success",
		"message": gin.H{
			"error": "",
			"msg":   "Task retrieved successfully",
		},
	})
}
func (tc *TaskController) UpdateTask(c *gin.Context) {
	taskID, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"data":   nil,
			"status": "error",
			"message": gin.H{
				"error": err.Error(),
				"msg":   "Invalid task ID",
			},
		})
		return
	}

	var task models.Task
	if err := c.ShouldBindJSON(&task); err != nil {
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

	if err := tc.taskService.UpdateTask(uint(taskID), &task); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"data":   nil,
			"status": "error",
			"message": gin.H{
				"error": err.Error(),
				"msg":   "Error updating task",
			},
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data":   task,
		"status": "success",
		"message": gin.H{
			"error": "",
			"msg":   "Task updated successfully",
		},
	})
}
func (tc *TaskController) DeleteTask(c *gin.Context) {
	taskID, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"data":   nil,
			"status": "error",
			"message": gin.H{
				"error": "Invalid task ID",
				"msg":   "Invalid task ID",
			},
		})
		return
	}
	if err := tc.taskService.DeleteTask(uint(taskID)); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"data":   nil,
			"status": "error",
			"message": gin.H{
				"error": err.Error(),
				"msg":   "Error deleting task",
			},
		})
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"data":   nil,
		"status": "success",
		"message": gin.H{
			"error": "",
			"msg":   "Task deleted successfully",
		},
	})
}
func (tc *TaskController) GetTasksByUserID(c *gin.Context) {
	userID, err := strconv.ParseUint(c.Param("user_id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"data":   nil,
			"status": "error",
			"message": gin.H{
				"error": "Invalid user ID",
				"msg":   "Invalid user ID",
			},
		})
		return
	}
	tasks, err := tc.taskService.GetTasksByUserID(uint(userID))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"data":   nil,
			"status": "error",
			"message": gin.H{
				"error": err.Error(),
				"msg":   "Error retrieving tasks",
			},
		})
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"data":   tasks,
		"status": "success",
		"message": gin.H{
			"error": "",
			"msg":   "Tasks retrieved successfully",
		},
	})
}

func (tc *TaskController) RequestTaskStatusChange(c *gin.Context) {
	taskID, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"data":   nil,
			"status": "error",
			"message": gin.H{
				"error": "Invalid task ID",
				"msg":   "Invalid task ID",
			},
		})
		return
	}

	var request struct {
		RequestedStatus string `json:"requestedStatus"`
	}

	if err := c.ShouldBindJSON(&request); err != nil {
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

	if err := tc.taskService.RequestTaskStatusChange(uint(taskID), request.RequestedStatus); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"data":   nil,
			"status": "error",
			"message": gin.H{
				"error": err.Error(),
				"msg":   "Error requesting task status change",
			},
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data":   nil,
		"status": "success",
		"message": gin.H{
			"error": "",
			"msg":   "Task status change requested successfully",
		},
	})
}
func (tc *TaskController) ApproveTaskStatusChange(c *gin.Context) {
	taskID, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"data":   nil,
			"status": "error",
			"message": gin.H{
				"error": "Invalid task ID",
				"msg":   "Invalid task ID",
			},
		})
		return
	}

	if err := tc.taskService.ApproveTaskStatusChange(uint(taskID)); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"data":   nil,
			"status": "error",
			"message": gin.H{
				"error": err.Error(),
				"msg":   "Error approving task status change",
			},
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data":   nil,
		"status": "success",
		"message": gin.H{
			"error": "",
			"msg":   "Task status change approved successfully",
		},
	})
}

func (tc *TaskController) CreateComment(c *gin.Context) {
	var comment models.Comment
	if err := c.ShouldBindJSON(&comment); err != nil {
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
	if err := tc.taskService.CreateComment(&comment); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"data":   nil,
			"status": "error",
			"message": gin.H{
				"error": err.Error(),
				"msg":   "Error creating comment",
			},
		})
		return
	}
	c.JSON(http.StatusCreated, gin.H{
		"data":   comment,
		"status": "success",
		"message": gin.H{
			"error": "",
			"msg":   "Comment created successfully",
		},
	})
}
func (tc *TaskController) GetCommentsByTaskID(c *gin.Context) {
	taskID, err := strconv.ParseUint(c.Param("task_id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"data":   nil,
			"status": "error",
			"message": gin.H{
				"error": "Invalid task ID",
				"msg":   "Invalid task ID",
			},
		})
		return
	}
	comments, err := tc.taskService.GetCommentsByTaskID(uint(taskID))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"data":   nil,
			"status": "error",
			"message": gin.H{
				"error": err.Error(),
				"msg":   "Error retrieving comments",
			},
		})
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"data":   comments,
		"status": "success",
		"message": gin.H{
			"error": "",
			"msg":   "Comments retrieved successfully",
		},
	})
}
func (tc *TaskController) UpdateComment(c *gin.Context) {
	commentID, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"data":   nil,
			"status": "error",
			"message": gin.H{
				"error": err.Error(),
				"msg":   "Invalid comment ID",
			},
		})
		return
	}

	var comment models.Comment
	if err := c.ShouldBindJSON(&comment); err != nil {
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

	if err := tc.taskService.UpdateComment(uint(commentID), &comment); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"data":   nil,
			"status": "error",
			"message": gin.H{
				"error": err.Error(),
				"msg":   "Error updating comment",
			},
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data":   comment,
		"status": "success",
		"message": gin.H{
			"error": "",
			"msg":   "Comment updated successfully",
		},
	})
}
func (tc *TaskController) DeleteComment(c *gin.Context) {
	commentID, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"data":   nil,
			"status": "error",
			"message": gin.H{
				"error": err.Error(),
				"msg":   "Invalid comment ID",
			},
		})
		return
	}

	if err := tc.taskService.DeleteComment(uint(commentID)); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"data":   nil,
			"status": "error",
			"message": gin.H{
				"error": err.Error(),
				"msg":   "Error deleting comment",
			},
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data":   nil,
		"status": "success",
		"message": gin.H{
			"error": "",
			"msg":   "Comment deleted successfully",
		},
	})
}
