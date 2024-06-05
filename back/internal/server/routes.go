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

	r.Any("/files/*any", gin.WrapH(http.StripPrefix("/files/", corsWrapper(s.fileService.TusdHandler))))

	return r
}

// corsWrapper wraps a handler with CORS headers and preflight OPTIONS request handling
func corsWrapper(handler http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Handle preflight request
		if r.Method == http.MethodOptions {
			w.Header().Set("Access-Control-Allow-Origin", "http://localhost:3000")
			w.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS")
			w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
			w.WriteHeader(http.StatusNoContent)
			return
		}
		// Set CORS headers for the main request
		w.Header().Set("Access-Control-Allow-Origin", "http://localhost:3000")
		handler.ServeHTTP(w, r)
	})
}
