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
	userController := controller.NewUserController(s.userService)
	r.POST("/user/signup", middleware.AuthMiddleware(), userController.SignUp)
	r.POST("/user/login", userController.LoginHandler)
	r.POST("/user/logout", userController.LogoutHandler)

	// Department routes
	departmentController := controller.NewDepartmentController(s.departmentService)
	r.POST("/department/create", middleware.AuthMiddleware(), departmentController.CreateDepartment)
	r.GET("/department/:id", middleware.AuthMiddleware(), departmentController.GetDepartmentByID)
	r.PUT("/department/update/:id", middleware.AuthMiddleware(), departmentController.UpdateDepartment)
	r.DELETE("/department/delete/:id", middleware.AuthMiddleware(), departmentController.DeleteDepartment)

	return r
}
