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
	userController := controller.NewUserController(s.userService, s.departmentService, s.roleService) // Update this line
	r.POST("/signup", middleware.AuthMiddleware(), userController.SignUp)
	r.POST("/login", userController.LoginHandler)
	r.POST("/logout", userController.LogoutHandler)
	//for the getAllRoles from userController
	r.GET("/roles", middleware.AuthMiddleware(), userController.GetAllRoles)

	// Department routes
	departmentController := controller.NewDepartmentController(s.departmentService)
	r.POST("/department/create", middleware.AuthMiddleware(), departmentController.CreateDepartment)
	r.GET("/department/:id", middleware.AuthMiddleware(), departmentController.GetDepartmentByID)
	r.PUT("/department/update/:id", middleware.AuthMiddleware(), departmentController.UpdateDepartment)
	r.DELETE("/department/delete/:id", middleware.AuthMiddleware(), departmentController.DeleteDepartment)
	r.GET("/departments", middleware.AuthMiddleware(), departmentController.GetAllDepartments)

	// Role routes
	roleController := controller.NewRoleController(s.roleService) // Update this line
	r.POST("/role", middleware.AuthMiddleware(), roleController.CreateRole)
	r.POST("/permission", middleware.AuthMiddleware(), roleController.CreatePermission)
	r.POST("/role_permission", middleware.AuthMiddleware(), roleController.CreateRolePermission)

	return r
}
