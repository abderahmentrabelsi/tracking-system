package server

import (
	"back/internal/repository"
	"back/internal/service"
	"fmt"
	"net/http"
	"os"
	"strconv"
	"time"

	"back/internal/database"
)

type Server struct {
	port              int
	db                database.Service
	userService       *service.UserService
	departmentService *service.DepartmentService
	roleService       *service.RoleService
	fileService       *service.FileService
}

func NewServer() *Server {
	port, _ := strconv.Atoi(os.Getenv("PORT"))
	db := database.New()

	userRepository := repository.NewUserRepository()
	roleRepository := repository.NewRoleRepository()
	departmentRepository := repository.NewDepartmentRepository()

	roleService := service.NewRoleService(roleRepository)
	userService := service.NewUserService(userRepository, roleRepository)
	departmentService := service.NewDepartmentService(departmentRepository)

	fileService := service.NewFileService(repository.NewFileRepository())

	return &Server{
		port:              port,
		db:                db,
		userService:       userService,
		departmentService: departmentService,
		roleService:       roleService,
		fileService:       fileService,
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
