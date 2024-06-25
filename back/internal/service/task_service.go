package service

import (
	"back/internal/model"
	"back/internal/repository"
)

type TaskService struct {
	taskRepo    *repository.TaskRepository
	commentRepo *repository.CommentRepository
}

func NewTaskService(taskRepo *repository.TaskRepository, commentRepo *repository.CommentRepository) *TaskService {
	return &TaskService{taskRepo: taskRepo, commentRepo: commentRepo}
}

func (ts *TaskService) CreateTask(task *models.Task) error {
	return ts.taskRepo.CreateTask(task)
}
func (ts *TaskService) GetTaskByID(taskID uint) (*models.Task, error) {
	return ts.taskRepo.GetTaskByID(taskID)
}
func (ts *TaskService) UpdateTask(taskID uint, task *models.Task) error {
	return ts.taskRepo.UpdateTask(taskID, task)
}

func (ts *TaskService) DeleteTask(taskID uint) error {
	return ts.taskRepo.DeleteTask(taskID)
}
func (ts *TaskService) GetTasksByUserID(userID uint) ([]models.Task, error) {
	return ts.taskRepo.GetTasksByUserID(userID)
}

func (ts *TaskService) RequestTaskStatusChange(taskID uint, requestedStatus string) error {
	return ts.taskRepo.RequestTaskStatusChange(taskID, requestedStatus)
}
func (ts *TaskService) ApproveTaskStatusChange(taskID uint) error {
	return ts.taskRepo.ApproveTaskStatusChange(taskID)
}

func (ts *TaskService) CreateComment(comment *models.Comment) error {
	return ts.commentRepo.CreateComment(comment)
}
func (ts *TaskService) GetCommentsByTaskID(taskID uint) ([]models.Comment, error) {
	return ts.commentRepo.GetCommentsByTaskID(taskID)
}
func (ts *TaskService) UpdateComment(commentID uint, comment *models.Comment) error {
	return ts.commentRepo.UpdateComment(commentID, comment)
}
func (ts *TaskService) DeleteComment(commentID uint) error {
	return ts.commentRepo.DeleteComment(commentID)
}
