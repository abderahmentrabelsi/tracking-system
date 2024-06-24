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
	r.GET("/users", middleware.AuthMiddleware(), userController.GetAllUsers)

	// Department routes
	departmentController := controller.NewDepartmentController(s.departmentService)
	r.POST("/department/create", middleware.AuthMiddleware(), middleware.AuthorizeRole("Admin", "Manager"), departmentController.CreateDepartment)
	r.GET("/department/:id", middleware.AuthMiddleware(), departmentController.GetDepartmentByID)
	r.PUT("/department/update/:id", middleware.AuthMiddleware(), middleware.AuthorizeRole("Admin", "Manager"), departmentController.UpdateDepartment)
	r.DELETE("/department/delete/:id", middleware.AuthMiddleware(), departmentController.DeleteDepartment)
	r.GET("/departments/:client", middleware.AuthMiddleware(), departmentController.GetAllDepartmentsByClient)

	// Client routes
	r.POST("/client/create", middleware.AuthMiddleware(), departmentController.CreateClient)
	r.GET("/client/", middleware.AuthMiddleware(), departmentController.GetAllClients)
	r.GET("/client/:id", middleware.AuthMiddleware(), departmentController.GetClientByID)
	r.PUT("/client/update/:id", middleware.AuthMiddleware(), departmentController.UpdateClient)
	r.DELETE("/client/delete/:id", middleware.AuthMiddleware(), departmentController.DeleteClient)

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

	// Calendar routes
	calendarController := controller.NewCalendarController(s.calendarService)
	r.POST("/calendars", middleware.AuthMiddleware(), middleware.AuthorizeRole("Admin", "Manager"), calendarController.CreateCalendar)
	r.GET("/calendars/:calendar_id", middleware.AuthMiddleware(), calendarController.GetCalendarByID)
	r.PUT("/calendars/:calendar_id", middleware.AuthMiddleware(), middleware.AuthorizeRole("Admin", "Manager"), calendarController.UpdateCalendar)
	r.DELETE("/calendars/:calendar_id", middleware.AuthMiddleware(), calendarController.DeleteCalendar)
	r.GET("/calendars/department/:department_id", middleware.AuthMiddleware(), calendarController.GetCalendarByDepartmentID)

	// Calendar Events routes
	r.POST("/calendars/:calendar_id/events", middleware.AuthMiddleware(), calendarController.CreateEvent)
	r.GET("/calendars/:calendar_id/events/:event_id", middleware.AuthMiddleware(), calendarController.GetEventByID)
	r.PUT("/calendars/:calendar_id/events/:event_id", middleware.AuthMiddleware(), calendarController.UpdateEvent)
	r.DELETE("/calendars/:calendar_id/events/:event_id", middleware.AuthMiddleware(), middleware.AuthorizeRole("Admin", "Manager"), calendarController.DeleteEvent)
	r.GET("/calendars/:calendar_id/events", middleware.AuthMiddleware(), calendarController.GetEventsByCalendarID)
	r.GET("/dep/:department_id/events", middleware.AuthMiddleware(), calendarController.GetEventsByDepartmentID)
	r.GET("/events/:event_id", middleware.AuthMiddleware(), calendarController.GetEventByID)

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
