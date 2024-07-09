package server

import (
	"back/internal/controller"
	"back/internal/middleware"
	"github.com/gin-gonic/gin"
	"net/http"
)

func (s *Server) RegisterRoutes() http.Handler {
	r := gin.Default()

	// User routes
	userController := controller.NewUserController(s.userService, s.departmentService, s.roleService, s.fileService)
	r.POST("/signup", middleware.AuthMiddleware(s.userService), middleware.AuthorizeRole("Admin"), userController.SignUp)
	r.POST("/login", userController.LoginHandler)
	r.POST("/logout", userController.LogoutHandler)
	r.GET("/roles", middleware.AuthMiddleware(s.userService), userController.GetAllRoles)
	r.GET("/user/:id", middleware.AuthMiddleware(s.userService), userController.GetUserByID)
	r.GET("/users", middleware.AuthMiddleware(s.userService), middleware.AuthorizeRole("Admin"), userController.GetAllUsers)
	r.GET("/user/details", middleware.AuthMiddleware(s.userService), userController.GetUserDetails)
	r.GET("/user/profile/:username", userController.GetUserDetailsByUsername)
	r.PUT("/user/profile/:username", middleware.AuthMiddleware(s.userService), userController.UpdateUserProfile)
	r.POST("/user/change-password", middleware.AuthMiddleware(s.userService), middleware.AuthorizeRole("Admin", "Manager", "Employee"), userController.ChangePassword) // Add this line
	r.GET("/user/:id/login-history", middleware.AuthMiddleware(s.userService), userController.GetLoginHistory)
	r.POST("/totp/generate", middleware.AuthMiddleware(s.userService), userController.GenerateTOTP)
	r.POST("/totp/verify", middleware.AuthMiddleware(s.userService), userController.VerifyTOTP)
	r.POST("/totp/disable", middleware.AuthMiddleware(s.userService), userController.DisableTOTP)
	r.GET("/totp/status", middleware.AuthMiddleware(s.userService), userController.IsTOTPEnabled)

	// Department routes
	departmentController := controller.NewDepartmentController(s.departmentService)
	r.POST("/department/create", middleware.AuthMiddleware(s.userService), middleware.AuthorizeRole("Admin", "Manager"), departmentController.CreateDepartment)
	r.GET("/department/:id", middleware.AuthMiddleware(s.userService), departmentController.GetDepartmentByID)
	r.PUT("/department/update/:id", middleware.AuthMiddleware(s.userService), middleware.AuthorizeRole("Admin", "Manager"), departmentController.UpdateDepartment)
	r.DELETE("/department/delete/:id", middleware.AuthMiddleware(s.userService), middleware.AuthorizeRole("Admin"), departmentController.DeleteDepartment)
	r.GET("/departments/:client", middleware.AuthMiddleware(s.userService), departmentController.GetAllDepartmentsByClient)
	r.GET("/department/:id/users", middleware.AuthMiddleware(s.userService), departmentController.GetUsersByDepartment)

	// Client routes
	r.POST("/client/create", middleware.AuthMiddleware(s.userService), middleware.AuthorizeRole("Admin"), departmentController.CreateClient)
	r.GET("/client/", middleware.AuthMiddleware(s.userService), middleware.AuthorizeRole("Admin", "Manager"), departmentController.GetAllClients)
	r.GET("/client/:id", middleware.AuthMiddleware(s.userService), middleware.AuthorizeRole("Admin", "Manager"), departmentController.GetClientByID)
	r.PUT("/client/update/:id", middleware.AuthMiddleware(s.userService), middleware.AuthorizeRole("Admin", "Manager"), departmentController.UpdateClient)
	r.DELETE("/client/delete/:id", middleware.AuthMiddleware(s.userService), middleware.AuthorizeRole("Admin"), departmentController.DeleteClient)

	// Role routes
	roleController := controller.NewRoleController(s.roleService)
	r.POST("/role", middleware.AuthMiddleware(s.userService), middleware.AuthorizeRole("Admin"), roleController.CreateRole)
	r.POST("/permission", middleware.AuthMiddleware(s.userService), middleware.AuthorizeRole("Admin"), roleController.CreatePermission)
	r.POST("/role_permission", middleware.AuthMiddleware(s.userService), middleware.AuthorizeRole("Admin"), roleController.CreateRolePermission)

	// Payroll routes
	payrollController := controller.NewPayrollController(s.payrollService)
	r.POST("/salary/create", middleware.AuthMiddleware(s.userService), middleware.AuthorizeRole("Admin", "Manager"), payrollController.CreateSalaryRecord)
	r.PUT("/salary/user/:userId", middleware.AuthMiddleware(s.userService), middleware.AuthorizeRole("Admin", "Manager"), payrollController.UpdateSalaryRecordByUserID)
	r.GET("/salary/user/:id", middleware.AuthMiddleware(s.userService), payrollController.GetSalaryRecordsByUserID)
	r.DELETE("/salary/user/:userId", middleware.AuthMiddleware(s.userService), middleware.AuthorizeRole("Admin"), payrollController.DeleteSalaryRecordByUserID)
	r.POST("/contract/create", middleware.AuthMiddleware(s.userService), middleware.AuthorizeRole("Admin", "Manager"), payrollController.CreateContractRecord)
	r.PUT("/contract/user/:userId", middleware.AuthMiddleware(s.userService), middleware.AuthorizeRole("Admin", "Manager"), payrollController.UpdateContractByUserID)
	r.GET("/contract/user/:userId", middleware.AuthMiddleware(s.userService), payrollController.GetContractByUserID)
	r.DELETE("/contract/user/:userId", middleware.AuthMiddleware(s.userService), middleware.AuthorizeRole("Admin"), payrollController.DeleteContractByUserID)

	// Hook routes
	hookController := controller.NewHookController(s.fileService)
	r.POST("/hooks/upload", middleware.AuthMiddleware(s.userService), middleware.AuthorizeRole("Admin", "Manager"), hookController.UploadHook)
	r.GET("/files", middleware.AuthMiddleware(s.userService), hookController.GetFiles)
	r.Any("/files/*any", gin.WrapH(http.StripPrefix("/files/", corsWrapper(s.fileService.TusdHandler))))

	return r
}

// corsWrapper wraps a handler with CORS headers and preflight OPTIONS request handling
func corsWrapper(handler http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Method == http.MethodOptions {
			w.Header().Set("Access-Control-Allow-Origin", "http://localhost:3000")
			w.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS")
			w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
			w.WriteHeader(http.StatusNoContent)
			return
		}
		w.Header().Set("Access-Control-Allow-Origin", "http://localhost:3000")
		handler.ServeHTTP(w, r)
	})
}
