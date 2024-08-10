package tests

import (
	"back/internal/controller"
	model "back/internal/model"
	"back/internal/orm"
	"back/internal/repository"
	"back/internal/service"
	"encoding/json"
	"fmt"
	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
	"net/http"
	"net/http/httptest"
	"strconv"
	"testing"
	"time"
)

var taskController *controller.TaskController

func setupTaskController() {
	taskRepo := repository.NewTaskRepository()
	commentRepo := repository.NewCommentRepository()
	taskService := service.NewTaskService(taskRepo, commentRepo)
	taskController = controller.NewTaskController(taskService)
}

func TestCreateTask(t *testing.T) {
	setupTaskController()

	task := &model.Task{
		Title:       "New Task",
		Description: "Task description",
		AssigneeID:  1,
		DueDate:     time.Now().Add(48 * time.Hour),
		Status:      "Pending",
	}
	requestBody, _ := json.Marshal(task)

	req := createRequest("POST", "/tasks", string(requestBody))
	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)
	c.Request = req

	taskController.CreateTask(c)

	assert.Equal(t, http.StatusCreated, w.Code)

	var response map[string]interface{}
	err := json.Unmarshal(w.Body.Bytes(), &response)
	assert.NoError(t, err)
	assert.Equal(t, "success", response["status"])

	// Cleanup
	orm.DB.Unscoped().Delete(&task)
}

func TestGetTaskByID(t *testing.T) {
	setupTaskController()

	task := &model.Task{
		Title:       "Get Task",
		Description: "Task description",
		AssigneeID:  1,
		DueDate:     time.Now().Add(48 * time.Hour),
		Status:      "Pending",
	}
	err := orm.DB.Create(task).Error
	assert.NoError(t, err)

	req := createRequest("GET", "/tasks/"+strconv.Itoa(int(task.ID)), "")
	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)
	c.Request = req
	c.Params = gin.Params{{Key: "id", Value: fmt.Sprintf("%d", task.ID)}}

	taskController.GetTaskByID(c)

	assert.Equal(t, http.StatusOK, w.Code)

	var response map[string]interface{}
	err = json.Unmarshal(w.Body.Bytes(), &response)
	assert.NoError(t, err)
	assert.Equal(t, "success", response["status"])

	// Cleanup
	orm.DB.Unscoped().Delete(&task)
}

func TestUpdateTask(t *testing.T) {
	setupTaskController()

	task := &model.Task{
		Title:       "Update Task",
		Description: "Task description",
		AssigneeID:  1,
		DueDate:     time.Now().Add(48 * time.Hour),
		Status:      "Pending",
	}
	err := orm.DB.Create(task).Error
	assert.NoError(t, err)

	task.Title = "Updated Task Title"
	requestBody, _ := json.Marshal(task)

	req := createRequest("PUT", "/tasks/"+strconv.Itoa(int(task.ID)), string(requestBody))
	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)
	c.Request = req
	c.Params = gin.Params{{Key: "id", Value: fmt.Sprintf("%d", task.ID)}}

	taskController.UpdateTask(c)

	assert.Equal(t, http.StatusOK, w.Code)

	var response map[string]interface{}
	err = json.Unmarshal(w.Body.Bytes(), &response)
	assert.NoError(t, err)
	assert.Equal(t, "success", response["status"])

	// Cleanup
	orm.DB.Unscoped().Delete(&task)
}

func TestDeleteTask(t *testing.T) {
	setupTaskController()

	task := &model.Task{
		Title:       "Delete Task",
		Description: "Task description",
		AssigneeID:  1,
		DueDate:     time.Now().Add(48 * time.Hour),
		Status:      "Pending",
	}
	err := orm.DB.Create(task).Error
	assert.NoError(t, err)

	req := createRequest("DELETE", "/tasks/"+strconv.Itoa(int(task.ID)), "")
	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)
	c.Request = req
	c.Params = gin.Params{{Key: "id", Value: fmt.Sprintf("%d", task.ID)}}

	taskController.DeleteTask(c)

	assert.Equal(t, http.StatusOK, w.Code)

	var response map[string]interface{}
	err = json.Unmarshal(w.Body.Bytes(), &response)
	assert.NoError(t, err)
	assert.Equal(t, "success", response["status"])
}

func TestGetTasksByUserID(t *testing.T) {
	setupTaskController()

	userID := uint(1)
	task1 := &model.Task{
		Title:       "Task 1",
		Description: "Task 1 description",
		AssigneeID:  userID,
		DueDate:     time.Now().Add(48 * time.Hour),
		Status:      "Pending",
	}
	task2 := &model.Task{
		Title:       "Task 2",
		Description: "Task 2 description",
		AssigneeID:  userID,
		DueDate:     time.Now().Add(48 * time.Hour),
		Status:      "Pending",
	}

	err := orm.DB.Create(task1).Error
	assert.NoError(t, err)
	err = orm.DB.Create(task2).Error
	assert.NoError(t, err)

	req := createRequest("GET", "/tasks/user/"+strconv.Itoa(int(userID)), "")
	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)
	c.Request = req
	c.Params = gin.Params{{Key: "user_id", Value: fmt.Sprintf("%d", userID)}}

	taskController.GetTasksByUserID(c)

	assert.Equal(t, http.StatusOK, w.Code)

	var response map[string]interface{}
	err = json.Unmarshal(w.Body.Bytes(), &response)
	assert.NoError(t, err)
	assert.Equal(t, "success", response["status"])

	// Cleanup
	orm.DB.Unscoped().Delete(&task1)
	orm.DB.Unscoped().Delete(&task2)
}

func TestRequestTaskStatusChange(t *testing.T) {
	setupTaskController()

	task := &model.Task{
		Title:       "Status Change Task",
		Description: "Task description",
		AssigneeID:  1,
		DueDate:     time.Now().Add(48 * time.Hour),
		Status:      "Pending",
	}
	err := orm.DB.Create(task).Error
	assert.NoError(t, err)

	requestBody := `{"requestedStatus": "In Progress"}`
	req := createRequest("POST", "/tasks/"+strconv.Itoa(int(task.ID))+"/request-status-change", requestBody)
	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)
	c.Request = req
	c.Params = gin.Params{{Key: "id", Value: fmt.Sprintf("%d", task.ID)}}

	taskController.RequestTaskStatusChange(c)

	assert.Equal(t, http.StatusOK, w.Code)

	var response map[string]interface{}
	err = json.Unmarshal(w.Body.Bytes(), &response)
	assert.NoError(t, err)
	assert.Equal(t, "success", response["status"])

	// Cleanup
	orm.DB.Unscoped().Delete(&task)
}

func TestApproveTaskStatusChange(t *testing.T) {
	setupTaskController()

	task := &model.Task{
		Title:           "Approve Status Task",
		Description:     "Task description",
		AssigneeID:      1,
		DueDate:         time.Now().Add(48 * time.Hour),
		Status:          "Pending",
		RequestedStatus: "In Progress",
	}
	err := orm.DB.Create(task).Error
	assert.NoError(t, err)

	req := createRequest("POST", "/tasks/"+strconv.Itoa(int(task.ID))+"/approve-status-change", "")
	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)
	c.Request = req
	c.Params = gin.Params{{Key: "id", Value: fmt.Sprintf("%d", task.ID)}}

	taskController.ApproveTaskStatusChange(c)

	assert.Equal(t, http.StatusOK, w.Code)

	var response map[string]interface{}
	err = json.Unmarshal(w.Body.Bytes(), &response)
	assert.NoError(t, err)
	assert.Equal(t, "success", response["status"])

	// Cleanup
	orm.DB.Unscoped().Delete(&task)
}

func TestCreateComment(t *testing.T) {
	setupTaskController()

	task := &model.Task{
		Title:       "Task for Comment",
		Description: "Task description",
		AssigneeID:  1,
		DueDate:     time.Now().Add(48 * time.Hour),
		Status:      "Pending",
	}
	err := orm.DB.Create(task).Error
	assert.NoError(t, err)

	comment := &model.Comment{
		Content: "This is a comment",
		TaskID:  task.ID,
		UserID:  1,
	}
	requestBody, _ := json.Marshal(comment)

	req := createRequest("POST", "/tasks/"+strconv.Itoa(int(task.ID))+"/comments", string(requestBody))
	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)
	c.Request = req

	taskController.CreateComment(c)

	assert.Equal(t, http.StatusCreated, w.Code)

	var response map[string]interface{}
	err = json.Unmarshal(w.Body.Bytes(), &response)
	assert.NoError(t, err)
	assert.Equal(t, "success", response["status"])

	// Cleanup
	orm.DB.Unscoped().Delete(&comment)
	orm.DB.Unscoped().Delete(&task)
}

func TestGetCommentsByTaskID(t *testing.T) {
	setupTaskController()

	task := &model.Task{
		Title:       "Task for Comments",
		Description: "Task description",
		AssigneeID:  1,
		DueDate:     time.Now().Add(48 * time.Hour),
		Status:      "Pending",
	}
	err := orm.DB.Create(task).Error
	assert.NoError(t, err)

	comment1 := &model.Comment{
		Content: "Comment 1",
		TaskID:  task.ID,
		UserID:  1,
	}
	comment2 := &model.Comment{
		Content: "Comment 2",
		TaskID:  task.ID,
		UserID:  1,
	}

	err = orm.DB.Create(comment1).Error
	assert.NoError(t, err)
	err = orm.DB.Create(comment2).Error
	assert.NoError(t, err)

	req := createRequest("GET", "/tasks/"+strconv.Itoa(int(task.ID))+"/comments", "")
	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)
	c.Request = req
	c.Params = gin.Params{{Key: "task_id", Value: fmt.Sprintf("%d", task.ID)}}

	taskController.GetCommentsByTaskID(c)

	assert.Equal(t, http.StatusOK, w.Code)

	var response map[string]interface{}
	err = json.Unmarshal(w.Body.Bytes(), &response)
	assert.NoError(t, err)
	assert.Equal(t, "success", response["status"])

	// Cleanup
	orm.DB.Unscoped().Delete(&comment1)
	orm.DB.Unscoped().Delete(&comment2)
	orm.DB.Unscoped().Delete(&task)
}

func TestUpdateComment(t *testing.T) {
	setupTaskController()

	task := &model.Task{
		Title:       "Task for Updating Comment",
		Description: "Task description",
		AssigneeID:  1,
		DueDate:     time.Now().Add(48 * time.Hour),
		Status:      "Pending",
	}
	err := orm.DB.Create(task).Error
	assert.NoError(t, err)

	comment := &model.Comment{
		Content: "Original Comment",
		TaskID:  task.ID,
		UserID:  1,
	}
	err = orm.DB.Create(comment).Error
	assert.NoError(t, err)

	comment.Content = "Updated Comment"
	requestBody, _ := json.Marshal(comment)

	req := createRequest("PUT", "/tasks/"+strconv.Itoa(int(task.ID))+"/comments/"+strconv.Itoa(int(comment.ID)), string(requestBody))
	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)
	c.Request = req
	c.Params = gin.Params{{Key: "id", Value: fmt.Sprintf("%d", comment.ID)}}

	taskController.UpdateComment(c)

	assert.Equal(t, http.StatusOK, w.Code)

	var response map[string]interface{}
	err = json.Unmarshal(w.Body.Bytes(), &response)
	assert.NoError(t, err)
	assert.Equal(t, "success", response["status"])

	// Cleanup
	orm.DB.Unscoped().Delete(&comment)
	orm.DB.Unscoped().Delete(&task)
}

func TestDeleteComment(t *testing.T) {
	setupTaskController()

	task := &model.Task{
		Title:       "Task for Deleting Comment",
		Description: "Task description",
		AssigneeID:  1,
		DueDate:     time.Now().Add(48 * time.Hour),
		Status:      "Pending",
	}
	err := orm.DB.Create(task).Error
	assert.NoError(t, err)

	comment := &model.Comment{
		Content: "Comment to be deleted",
		TaskID:  task.ID,
		UserID:  1,
	}
	err = orm.DB.Create(comment).Error
	assert.NoError(t, err)

	req := createRequest("DELETE", "/tasks/"+strconv.Itoa(int(task.ID))+"/comments/"+strconv.Itoa(int(comment.ID)), "")
	w := httptest.NewRecorder()
	c, _ := gin.CreateTestContext(w)
	c.Request = req
	c.Params = gin.Params{{Key: "id", Value: fmt.Sprintf("%d", comment.ID)}}

	taskController.DeleteComment(c)

	assert.Equal(t, http.StatusOK, w.Code)

	var response map[string]interface{}
	err = json.Unmarshal(w.Body.Bytes(), &response)
	assert.NoError(t, err)
	assert.Equal(t, "success", response["status"])

	// Cleanup
	orm.DB.Unscoped().Delete(&comment)
	orm.DB.Unscoped().Delete(&task)
}
