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
	calendarService   *service.CalendarService
}

func NewServer() *Server {
	port, _ := strconv.Atoi(os.Getenv("PORT"))
	db := database.New()

	userRepository := repository.NewUserRepository()
	roleRepository := repository.NewRoleRepository()
	departmentRepository := repository.NewDepartmentRepository()
	calendarRepository := repository.NewCalendarRepository()
	payrollRepository := repository.NewPayrollRepository()

	roleService := service.NewRoleService(roleRepository)
	fileService := service.NewFileService(repository.NewFileRepository())
	userService := service.NewUserService(userRepository, roleRepository, fileService)
	departmentService := service.NewDepartmentService(departmentRepository)
	payrollService := service.NewPayrollService(*payrollRepository)
	CalendarService := service.NewCalendarService(*calendarRepository)

	return &Server{
		port:              port,
		db:                db,
		userService:       userService,
		departmentService: departmentService,
		roleService:       roleService,
		payrollService:    payrollService,
		fileService:       fileService,
		calendarService:   CalendarService,
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
