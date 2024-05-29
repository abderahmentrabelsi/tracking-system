package server

import (
	"net/http"

	"github.com/gin-gonic/gin"

	"back/internal/controller"
	"back/internal/middleware"
)

func (s *Server) RegisterRoutes() http.Handler {
	r := gin.Default()

	// User routes
	userController := controller.NewUserController(s.userService, s.departmentService, s.roleService)
	r.POST("/signup", middleware.AuthMiddleware(), userController.SignUp)
	r.POST("/login", userController.LoginHandler)
	r.POST("/logout", userController.LogoutHandler)
	r.GET("/roles", middleware.AuthMiddleware(), userController.GetAllRoles)

	// Department routes
	departmentController := controller.NewDepartmentController(s.departmentService)
	r.POST("/department/create", middleware.AuthMiddleware(), departmentController.CreateDepartment)
	r.GET("/department/:id", middleware.AuthMiddleware(), departmentController.GetDepartmentByID)
	r.PUT("/department/update/:id", middleware.AuthMiddleware(), departmentController.UpdateDepartment)
	r.DELETE("/department/delete/:id", middleware.AuthMiddleware(), departmentController.DeleteDepartment)
	r.GET("/departments", middleware.AuthMiddleware(), departmentController.GetAllDepartments)

	// Role routes
	roleController := controller.NewRoleController(s.roleService)
	r.POST("/role", middleware.AuthMiddleware(), roleController.CreateRole)
	r.POST("/permission", middleware.AuthMiddleware(), roleController.CreatePermission)
	r.POST("/role_permission", middleware.AuthMiddleware(), roleController.CreateRolePermission)

	// Payroll routes
	payrollController := controller.NewPayrollController(s.payrollService)
	r.POST("/salary/create", middleware.AuthMiddleware(), payrollController.CreateSalaryRecord)
	r.PUT("/salary/user/:userId", middleware.AuthMiddleware(), payrollController.UpdateSalaryRecordByUserID)
	r.GET("/salary/user/:id", middleware.AuthMiddleware(), payrollController.GetSalaryRecordsByUserID)
	r.DELETE("/salary/user/:userId", middleware.AuthMiddleware(), payrollController.DeleteSalaryRecordByUserID)
	r.POST("/contract/create", middleware.AuthMiddleware(), payrollController.CreateContractRecord)
	r.PUT("/contract/user/:userId", middleware.AuthMiddleware(), payrollController.UpdateContractByUserID)
	r.GET("/contract/user/:userId", middleware.AuthMiddleware(), payrollController.GetContractByUserID)
	r.DELETE("/contract/user/:userId", middleware.AuthMiddleware(), payrollController.DeleteContractByUserID)

	// Hook routes
	hookController := controller.NewHookController(s.fileService)
	r.POST("/hooks/upload", hookController.UploadHook)

	r.Any("/files/*any", gin.WrapH(http.StripPrefix("/files/", s.fileService.TusdHandler)))

	return r
}
