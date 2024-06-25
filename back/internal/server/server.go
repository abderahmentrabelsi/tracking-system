package server

import (
	"back/internal/database"
	"back/internal/repository"
	"back/internal/service"
	"fmt"
	"net/http"
	"os"
	"strconv"
	"time"
)

type Server struct {
	port              int
	db                database.Service
	userService       *service.UserService
	departmentService *service.DepartmentService
	roleService       *service.RoleService
	payrollService    *service.PayrollService
	fileService       *service.FileService
	taskService       *service.TaskService
}

func NewServer() *Server {
	port, _ := strconv.Atoi(os.Getenv("PORT"))
	db := database.New()

	userRepository := repository.NewUserRepository()
	roleRepository := repository.NewRoleRepository()
	departmentRepository := repository.NewDepartmentRepository()
	payrollRepository := repository.NewPayrollRepository()
	taskRepository := repository.NewTaskRepository()
	commentRepository := repository.NewCommentRepository()

	roleService := service.NewRoleService(roleRepository)
	fileService := service.NewFileService(repository.NewFileRepository())
	userService := service.NewUserService(userRepository, roleRepository, fileService)
	departmentService := service.NewDepartmentService(departmentRepository)
	payrollService := service.NewPayrollService(*payrollRepository)
	taskService := service.NewTaskService(taskRepository, commentRepository)

	return &Server{
		port:              port,
		db:                db,
		userService:       userService,
		departmentService: departmentService,
		roleService:       roleService,
		payrollService:    payrollService,
		fileService:       fileService,
		taskService:       taskService,
	}
}

func (s *Server) Start() error {
	server := &http.Server{
		Addr:         fmt.Sprintf(":%d", s.port),
		Handler:      s.RegisterRoutes(),
		IdleTimeout:  time.Minute,
		ReadTimeout:  10 * time.Second,
		WriteTimeout: 30 * time.Second,
	}

	return server.ListenAndServe()
}
