package repository

import (
	"back/internal/model"
	"back/internal/orm"
	"fmt"
)

type TaskRepository struct{}

func NewTaskRepository() *TaskRepository {
	return &TaskRepository{}
}

type CommentRepository struct{}

func NewCommentRepository() *CommentRepository {
	return &CommentRepository{}
}

func (tr *TaskRepository) CreateTask(task *models.Task) error {
	if err := orm.DB.Create(task).Error; err != nil {
		return fmt.Errorf("failed to create task: %v", err)
	}
	return nil
}
func (tr *TaskRepository) GetTaskByID(taskID uint) (*models.Task, error) {
	var task models.Task
	if err := orm.DB.Preload("Comments").Preload("Assignee").Preload("Manager").Preload("Department").First(&task, taskID).Error; err != nil {
		return nil, fmt.Errorf("failed to retrieve task: %v", err)
	}
	return &task, nil
}
func (tr *TaskRepository) UpdateTask(taskID uint, updatedTask *models.Task) error {
	var task models.Task
	if err := orm.DB.First(&task, taskID).Error; err != nil {
		return fmt.Errorf("failed to retrieve task: %v", err)
	}

	// Update the task fields
	task.Title = updatedTask.Title
	task.Description = updatedTask.Description
	task.Status = updatedTask.Status
	task.AssigneeID = updatedTask.AssigneeID
	task.ManagerID = updatedTask.ManagerID
	task.DueDate = updatedTask.DueDate
	task.DepartmentID = updatedTask.DepartmentID

	if err := orm.DB.Save(&task).Error; err != nil {
		return fmt.Errorf("failed to update task: %v", err)
	}
	return nil
}

func (tr *TaskRepository) DeleteTask(taskID uint) error {
	if err := orm.DB.Delete(&models.Task{}, taskID).Error; err != nil {
		return fmt.Errorf("failed to delete task: %v", err)
	}
	return nil
}
func (tr *TaskRepository) GetTasksByUserID(userID uint) ([]models.Task, error) {
	var tasks []models.Task
	if err := orm.DB.Where("assignee_id = ?", userID).Find(&tasks).Error; err != nil {
		return nil, fmt.Errorf("failed to retrieve tasks: %v", err)
	}
	return tasks, nil
}

func (cr *CommentRepository) CreateComment(comment *models.Comment) error {
	if err := orm.DB.Create(comment).Error; err != nil {
		return fmt.Errorf("failed to create comment: %v", err)
	}
	return nil
}
func (cr *CommentRepository) GetCommentsByTaskID(taskID uint) ([]models.Comment, error) {
	var comments []models.Comment
	if err := orm.DB.Preload("User").Preload("Task").Where("task_id = ?", taskID).Find(&comments).Error; err != nil {
		return nil, fmt.Errorf("failed to retrieve comments: %v", err)
	}
	return comments, nil
}
func (cr *CommentRepository) UpdateComment(commentID uint, updatedComment *models.Comment) error {
	var comment models.Comment
	if err := orm.DB.First(&comment, commentID).Error; err != nil {
		return fmt.Errorf("failed to retrieve comment: %v", err)
	}

	comment.Content = updatedComment.Content

	if err := orm.DB.Save(&comment).Error; err != nil {
		return fmt.Errorf("failed to update comment: %v", err)
	}
	return nil
}
func (cr *CommentRepository) DeleteComment(commentID uint) error {
	if err := orm.DB.Delete(&models.Comment{}, commentID).Error; err != nil {
		return fmt.Errorf("failed to delete comment: %v", err)
	}
	return nil
}
