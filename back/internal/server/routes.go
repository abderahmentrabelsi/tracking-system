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
	r.POST("/signup", middleware.AuthMiddleware(), middleware.AuthorizeRole("Admin"), userController.SignUp)
	r.POST("/login", userController.LoginHandler)
	r.POST("/logout", userController.LogoutHandler)
	r.GET("/roles", middleware.AuthMiddleware(), userController.GetAllRoles)
	r.GET("/user/:id", middleware.AuthMiddleware(), userController.GetUserByID)
	r.GET("/users", middleware.AuthMiddleware(), middleware.AuthorizeRole("Admin"), userController.GetAllUsers)

	// Department routes
	departmentController := controller.NewDepartmentController(s.departmentService)
	r.POST("/department/create", middleware.AuthMiddleware(), middleware.AuthorizeRole("Admin", "Manager"), departmentController.CreateDepartment)
	r.GET("/department/:id", middleware.AuthMiddleware(), departmentController.GetDepartmentByID)
	r.PUT("/department/update/:id", middleware.AuthMiddleware(), middleware.AuthorizeRole("Admin", "Manager"), departmentController.UpdateDepartment)
	r.DELETE("/department/delete/:id", middleware.AuthMiddleware(), middleware.AuthorizeRole("Admin"), departmentController.DeleteDepartment)
	r.GET("/departments/:client", middleware.AuthMiddleware(), departmentController.GetAllDepartmentsByClient)

	// Client routes
	r.POST("/client/create", middleware.AuthMiddleware(), middleware.AuthorizeRole("Admin"), departmentController.CreateClient)
	r.GET("/client/", middleware.AuthMiddleware(), middleware.AuthorizeRole("Admin", "Manager"), departmentController.GetAllClients)
	r.GET("/client/:id", middleware.AuthMiddleware(), middleware.AuthorizeRole("Admin", "Manager"), departmentController.GetClientByID)
	r.PUT("/client/update/:id", middleware.AuthMiddleware(), middleware.AuthorizeRole("Admin", "Manager"), departmentController.UpdateClient)
	r.DELETE("/client/delete/:id", middleware.AuthMiddleware(), middleware.AuthorizeRole("Admin"), departmentController.DeleteClient)

	// Role routes
	roleController := controller.NewRoleController(s.roleService)
	r.POST("/role", middleware.AuthMiddleware(), middleware.AuthorizeRole("Admin"), roleController.CreateRole)
	r.POST("/permission", middleware.AuthMiddleware(), middleware.AuthorizeRole("Admin"), roleController.CreatePermission)
	r.POST("/role_permission", middleware.AuthMiddleware(), middleware.AuthorizeRole("Admin"), roleController.CreateRolePermission)

	// Payroll routes
	payrollController := controller.NewPayrollController(s.payrollService)
	r.POST("/salary/create", middleware.AuthMiddleware(), middleware.AuthorizeRole("Admin", "Manager"), payrollController.CreateSalaryRecord)
	r.PUT("/salary/user/:userId", middleware.AuthMiddleware(), middleware.AuthorizeRole("Admin", "Manager"), payrollController.UpdateSalaryRecordByUserID)
	r.GET("/salary/user/:id", middleware.AuthMiddleware(), payrollController.GetSalaryRecordsByUserID)
	r.DELETE("/salary/user/:userId", middleware.AuthMiddleware(), middleware.AuthorizeRole("Admin"), payrollController.DeleteSalaryRecordByUserID)
	r.POST("/contract/create", middleware.AuthMiddleware(), middleware.AuthorizeRole("Admin", "Manager"), payrollController.CreateContractRecord)
	r.PUT("/contract/user/:userId", middleware.AuthMiddleware(), middleware.AuthorizeRole("Admin", "Manager"), payrollController.UpdateContractByUserID)
	r.GET("/contract/user/:userId", middleware.AuthMiddleware(), payrollController.GetContractByUserID)
	r.DELETE("/contract/user/:userId", middleware.AuthMiddleware(), middleware.AuthorizeRole("Admin"), payrollController.DeleteContractByUserID)

	// Hook routes
	hookController := controller.NewHookController(s.fileService)
	r.POST("/hooks/upload", middleware.AuthMiddleware(), middleware.AuthorizeRole("Admin", "Manager"), hookController.UploadHook)
	r.GET("/files", middleware.AuthMiddleware(), hookController.GetFiles)
	r.Any("/files/*any", gin.WrapH(http.StripPrefix("/files/", corsWrapper(s.fileService.TusdHandler))))

	// Task routes
	taskController := controller.NewTaskController(s.taskService)
	r.POST("/task/create", middleware.AuthMiddleware(), taskController.CreateTask)
	r.GET("/task/:id", middleware.AuthMiddleware(), taskController.GetTaskByID)
	r.PUT("/task/:id", middleware.AuthMiddleware(), taskController.UpdateTask)
	r.DELETE("/task/:id", middleware.AuthMiddleware(), taskController.DeleteTask)
	r.GET("/tasks/user/:user_id", middleware.AuthMiddleware(), taskController.GetTasksByUserID)

	// Task status change routes
	r.PUT("/task/:id/request-status-change", middleware.AuthMiddleware(), taskController.RequestTaskStatusChange)
	r.PUT("/task/:id/approve-status-change", middleware.AuthMiddleware(), middleware.AuthorizeRole("Manager"), taskController.ApproveTaskStatusChange)

	// Comment routes
	commentController := controller.NewTaskController(s.taskService)
	r.POST("/comments", middleware.AuthMiddleware(), commentController.CreateComment)
	r.GET("/comments/task/:task_id", middleware.AuthMiddleware(), commentController.GetCommentsByTaskID)
	r.PUT("/comments/:id", middleware.AuthMiddleware(), commentController.UpdateComment)
	r.DELETE("/comments/:id", middleware.AuthMiddleware(), commentController.DeleteComment)

	// Timesheet Routes
	timesheetController := controller.NewTimesheetController(s.WorkHoursService)
	r.POST("/checkin", middleware.AuthMiddleware(), timesheetController.CheckIn)
	r.PUT("/checkout/:id", middleware.AuthMiddleware(), timesheetController.CheckOut)
	r.GET("/timesheet/:userID", middleware.AuthMiddleware(), timesheetController.GetTimesheet)
	r.POST("/timesheet/edit-request", middleware.AuthMiddleware(), timesheetController.RequestEdit)
	r.POST("/timesheet/approve-edit", middleware.AuthMiddleware(), timesheetController.ApproveEdit)
	r.POST("/timesheet/date-range", middleware.AuthMiddleware(), timesheetController.GetTimesheetByDateRange)

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
