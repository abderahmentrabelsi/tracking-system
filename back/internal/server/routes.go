package server

import (
	"back/internal/controller"
	"back/internal/middleware"
	"github.com/gin-gonic/gin"
	swaggerfiles "github.com/swaggo/files"
	ginSwagger "github.com/swaggo/gin-swagger"
	"net/http"
)

func (s *Server) RegisterRoutes() http.Handler {
	r := gin.Default()

	r.GET("/analytics", controller.GetAnalyticsData)
	r.GET("/swagger/*any", ginSwagger.WrapHandler(swaggerfiles.Handler))

	userController := controller.NewUserController(s.userService, s.departmentService, s.roleService, s.fileService)
	r.POST("/signup", middleware.AuthMiddleware(s.userService), middleware.AuthorizeRole("Admin"), userController.SignUp)
	r.POST("/login", userController.LoginHandler)
	r.POST("/logout", userController.LogoutHandler)
	r.GET("/roles", middleware.AuthMiddleware(s.userService), userController.GetAllRoles)
	r.GET("/user/profile/*username", middleware.AuthMiddleware(s.userService), userController.GetUserDetailsByUsername)

	r.GET("/user/:id", middleware.AuthMiddleware(s.userService), userController.GetUserByID)
	r.GET("/user/user/:userID/files", middleware.AuthMiddleware(s.userService), userController.GetUserFiles)

	r.GET("/users", middleware.AuthMiddleware(s.userService), middleware.AuthorizeRole("Admin", "Manager"), userController.GetAllUsers)
	r.GET("/user/details", middleware.AuthMiddleware(s.userService), userController.GetUserDetails)
	r.PUT("/user/profile/:username", middleware.AuthMiddleware(s.userService), userController.UpdateUserProfile)
	r.POST("/user/change-password", middleware.AuthMiddleware(s.userService), middleware.AuthorizeRole("Admin", "Manager", "Employee"), userController.ChangePassword)
	r.GET("/user/:id/login-history", middleware.AuthMiddleware(s.userService), userController.GetLoginHistory)
	r.POST("/totp/generate", middleware.AuthMiddleware(s.userService), userController.GenerateTOTP)
	r.POST("/totp/verify", middleware.AuthMiddleware(s.userService), userController.VerifyTOTP)
	r.POST("/totp/disable", middleware.AuthMiddleware(s.userService), userController.DisableTOTP)
	r.POST("/totp/enable", middleware.AuthMiddleware(s.userService), userController.EnableTOTP)
	r.GET("/totp/status", middleware.AuthMiddleware(s.userService), userController.IsTOTPEnabled)
	r.POST("/login/totp", userController.VerifyLoginTOTP)

	// Add the new UpdateUser route
	r.PUT("/user/update", middleware.AuthMiddleware(s.userService), userController.UpdateUser)

	departmentController := controller.NewDepartmentController(s.departmentService)
	r.POST("/department/create", middleware.AuthMiddleware(s.userService), middleware.AuthorizeRole("Admin", "Manager"), departmentController.CreateDepartment)
	r.GET("/department/:id", middleware.AuthMiddleware(s.userService), departmentController.GetDepartmentByID)
	r.PUT("/department/update/:id", middleware.AuthMiddleware(s.userService), middleware.AuthorizeRole("Admin", "Manager"), departmentController.UpdateDepartment)
	r.DELETE("/department/delete/:id", middleware.AuthMiddleware(s.userService), middleware.AuthorizeRole("Admin"), departmentController.DeleteDepartment)
	r.GET("/departments/:client", middleware.AuthMiddleware(s.userService), departmentController.GetAllDepartmentsByClient)
	r.GET("/department/:id/users", middleware.AuthMiddleware(s.userService), departmentController.GetUsersByDepartment)
	r.GET("/department/:id/supervisor", middleware.AuthMiddleware(s.userService), departmentController.GetSupervisorByDepartmentID)

	r.POST("/client/create", middleware.AuthMiddleware(s.userService), middleware.AuthorizeRole("Admin"), departmentController.CreateClient)
	r.GET("/client/", middleware.AuthMiddleware(s.userService), middleware.AuthorizeRole("Admin", "Manager"), departmentController.GetAllClients)
	r.GET("/client/:id", middleware.AuthMiddleware(s.userService), middleware.AuthorizeRole("Admin", "Manager"), departmentController.GetClientByID)
	r.PUT("/client/update/:id", middleware.AuthMiddleware(s.userService), middleware.AuthorizeRole("Admin", "Manager"), departmentController.UpdateClient)
	r.DELETE("/client/delete/:id", middleware.AuthMiddleware(s.userService), middleware.AuthorizeRole("Admin"), departmentController.DeleteClient)

	roleController := controller.NewRoleController(s.roleService)
	r.POST("/role", middleware.AuthMiddleware(s.userService), middleware.AuthorizeRole("Admin"), roleController.CreateRole)

	payrollController := controller.NewPayrollController(s.payrollService)
	r.POST("/salary/create", middleware.AuthMiddleware(s.userService), middleware.AuthorizeRole("Admin", "Manager"), payrollController.CreateSalaryRecord)
	r.PUT("/salary/user/:userId", middleware.AuthMiddleware(s.userService), middleware.AuthorizeRole("Admin", "Manager"), payrollController.UpdateSalaryRecordByUserID)
	r.GET("/salary/user/:id", middleware.AuthMiddleware(s.userService), payrollController.GetSalaryRecordsByUserID)
	r.DELETE("/salary/user/:userId", middleware.AuthMiddleware(s.userService), middleware.AuthorizeRole("Admin"), payrollController.DeleteSalaryRecordByUserID)
	r.POST("/contract/create", middleware.AuthMiddleware(s.userService), middleware.AuthorizeRole("Admin", "Manager"), payrollController.CreateContractRecord)
	r.PUT("/contract/user/:userId", middleware.AuthMiddleware(s.userService), middleware.AuthorizeRole("Admin", "Manager"), payrollController.UpdateContractByUserID)
	r.GET("/contract/user/:userId", middleware.AuthMiddleware(s.userService), payrollController.GetContractByUserID)
	r.DELETE("/contract/user/:userId", middleware.AuthMiddleware(s.userService), middleware.AuthorizeRole("Admin"), payrollController.DeleteContractByUserID)

	hookController := controller.NewHookController(s.fileService)
	r.POST("/hooks/upload", middleware.AuthMiddleware(s.userService), middleware.AuthorizeRole("Admin", "Manager"), hookController.UploadHook)
	r.GET("/files", middleware.AuthMiddleware(s.userService), hookController.GetFiles)
	r.Any("/files/*any", gin.WrapH(http.StripPrefix("/files/", corsWrapper(s.fileService.TusdHandler))))

	// Task routes
	taskController := controller.NewTaskController(s.taskService)
	r.POST("/task/create", middleware.AuthMiddleware(s.userService), taskController.CreateTask)
	r.GET("/task/:id", middleware.AuthMiddleware(s.userService), taskController.GetTaskByID)
	r.PUT("/task/:id", middleware.AuthMiddleware(s.userService), taskController.UpdateTask)
	r.DELETE("/task/:id", middleware.AuthMiddleware(s.userService), taskController.DeleteTask)
	r.GET("/tasks/user/:user_id", middleware.AuthMiddleware(s.userService), taskController.GetTasksByUserID)

	// Task status change routes
	r.PUT("/task/:id/request-status-change", middleware.AuthMiddleware(s.userService), taskController.RequestTaskStatusChange)
	r.PUT("/task/:id/approve-status-change", middleware.AuthMiddleware(s.userService), middleware.AuthorizeRole("Manager"), taskController.ApproveTaskStatusChange)

	// Comment routes
	commentController := controller.NewTaskController(s.taskService)
	r.POST("/comments", middleware.AuthMiddleware(s.userService), commentController.CreateComment)
	r.GET("/comments/task/:task_id", middleware.AuthMiddleware(s.userService), commentController.GetCommentsByTaskID)
	r.PUT("/comments/:id", middleware.AuthMiddleware(s.userService), commentController.UpdateComment)
	r.DELETE("/comments/:id", middleware.AuthMiddleware(s.userService), commentController.DeleteComment)

	// Project routes
	projectController := controller.NewProjectController(s.projectService)
	r.POST("/projects", middleware.AuthMiddleware(s.userService), projectController.CreateProject)
	r.GET("/project/:id", middleware.AuthMiddleware(s.userService), projectController.GetProjectByID)
	r.PUT("/projects/:project_id", middleware.AuthMiddleware(s.userService), projectController.UpdateProject)
	r.DELETE("/projects/:project_id", middleware.AuthMiddleware(s.userService), projectController.DeleteProject)
	r.GET("/users/:userId/projects", middleware.AuthMiddleware(s.userService), projectController.GetProjectsByUserID)
	r.POST("/projects/:project_id/users/:user_id", middleware.AuthMiddleware(s.userService), projectController.AddUserToProject)
	r.DELETE("/projects/:project_id/users/:user_id", middleware.AuthMiddleware(s.userService), projectController.RemoveUserFromProject)
	r.GET("/project/:id/managers", middleware.AuthMiddleware(s.userService), projectController.GetManagersByProjectID)
	r.GET("/project/:id/users", middleware.AuthMiddleware(s.userService), projectController.GetUsersByProjectID)
	r.POST("/projects/:project_id/managers/:manager_id", middleware.AuthMiddleware(s.userService), projectController.AddManagerToProject)
	r.DELETE("/projects/:project_id/managers/:manager_id", middleware.AuthMiddleware(s.userService), projectController.RemoveManagerFromProject)

	// Timesheet Routes
	timesheetController := controller.NewTimesheetController(s.workHoursService)
	r.POST("/checkin", middleware.AuthMiddleware(s.userService), timesheetController.CheckIn)
	r.PUT("/checkout/:id", middleware.AuthMiddleware(s.userService), timesheetController.CheckOut)
	r.GET("/timesheet/:userID", middleware.AuthMiddleware(s.userService), timesheetController.GetTimesheet)
	r.POST("/timesheet/edit-request", middleware.AuthMiddleware(s.userService), timesheetController.RequestEdit)
	r.POST("/timesheet/approve-edit", middleware.AuthMiddleware(s.userService), timesheetController.ApproveEdit)
	r.POST("/timesheet/date-range", middleware.AuthMiddleware(s.userService), timesheetController.GetTimesheetByDateRange)
	// Calendar routes
	calendarController := controller.NewCalendarController(s.calendarService)
	r.POST("/calendars", middleware.AuthMiddleware(s.userService), middleware.AuthorizeRole("Admin", "Manager"), calendarController.CreateCalendar)
	r.GET("/calendars/:calendar_id", middleware.AuthMiddleware(s.userService), calendarController.GetCalendarByID)
	r.PUT("/calendars/:calendar_id", middleware.AuthMiddleware(s.userService), middleware.AuthorizeRole("Admin", "Manager"), calendarController.UpdateCalendar)
	r.DELETE("/calendars/:calendar_id", middleware.AuthMiddleware(s.userService), calendarController.DeleteCalendar)
	r.GET("/calendars/department/:department_id", middleware.AuthMiddleware(s.userService), calendarController.GetCalendarByDepartmentID)

	// Calendar Events routes
	r.POST("/calendars/:calendar_id/events", middleware.AuthMiddleware(s.userService), calendarController.CreateEvent)
	r.GET("/calendars/:calendar_id/events/:event_id", middleware.AuthMiddleware(s.userService), calendarController.GetEventByID)
	r.PUT("/calendars/:calendar_id/events/:event_id", middleware.AuthMiddleware(s.userService), calendarController.UpdateEvent)
	r.DELETE("/calendars/:calendar_id/events/:event_id", middleware.AuthMiddleware(s.userService), middleware.AuthorizeRole("Admin", "Manager"), calendarController.DeleteEvent)
	r.GET("/calendars/:calendar_id/events", middleware.AuthMiddleware(s.userService), calendarController.GetEventsByCalendarID)
	r.GET("/dep/:department_id/events", middleware.AuthMiddleware(s.userService), calendarController.GetEventsByDepartmentID)
	r.GET("/events/:event_id", middleware.AuthMiddleware(s.userService), calendarController.GetEventByID)

	// Leave Request Routes
	leaveController := controller.NewLeaveController(s.leaveService)
	r.POST("/leave-request", middleware.AuthMiddleware(s.userService), leaveController.CreateLeaveRequest)
	r.PUT("/leave-request/:id/approve", middleware.AuthMiddleware(s.userService), leaveController.ApproveLeaveRequest)
	r.GET("/leave-requests/:userId", middleware.AuthMiddleware(s.userService), leaveController.GetLeaveRequests)
	r.DELETE("/leave-request/:id", middleware.AuthMiddleware(s.userService), leaveController.DeleteLeaveRequest)

	return r
}

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
