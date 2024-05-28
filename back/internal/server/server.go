package server

import (
	"back/internal/database"
	"back/internal/repository"
	"back/internal/service"
	"os"
	"strconv"
)

type Server struct {
	port              int
	db                database.Service
	userService       *service.UserService
	departmentService *service.DepartmentService
	roleService       *service.RoleService
	payrollService    *service.PayrollService
}

func NewServer() *Server {
	port, _ := strconv.Atoi(os.Getenv("PORT"))
	db := database.New()

	userRepository := repository.NewUserRepository()
	roleRepository := repository.NewRoleRepository()
	departmentRepository := repository.NewDepartmentRepository()
	payrollRepository := repository.NewPayrollRepository()

	roleService := service.NewRoleService(roleRepository)
	userService := service.NewUserService(userRepository, roleRepository)
	departmentService := service.NewDepartmentService(departmentRepository)
	payrollService := service.NewPayrollService(*payrollRepository)

	return &Server{
		port:              port,
		db:                db,
		userService:       userService,
		departmentService: departmentService,
		roleService:       roleService,
		payrollService:    payrollService, // Assign payroll service to the payrollService field
	}
}
