package main

import (
	"back/docs"
	model "back/internal/model"
	"back/internal/orm"
	"back/internal/server"
	"fmt"
	"github.com/rs/cors"
	_ "github.com/swaggo/files"
	_ "github.com/swaggo/gin-swagger"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
	"log"
	"net/http"
	"os"
	"time"
)

func main() {
	initializeORM()
	srv := server.NewServer()
	router := srv.RegisterRoutes()

	docs.SwaggerInfo.BasePath = "/"

	corsConfig := cors.New(cors.Options{
		AllowedOrigins:   []string{"*"},
		AllowCredentials: true,
		AllowedMethods:   []string{"GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"},
		AllowedHeaders:   []string{"Origin", "Content-Length", "Content-Type", "Authorization", "Tus-Resumable", "Upload-Length", "Upload-Metadata", "Upload-Offset"},
		MaxAge:           int(12 * time.Hour / time.Second),
	})
	handler := corsConfig.Handler(router)

	// Middleware for handling TUS headers
	tusMiddleware := func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			if r.Header.Get("Tus-Resumable") == "1.0.0" {
				w.Header().Set("Tus-Resumable", "1.0.0")
			}
			next.ServeHTTP(w, r)
		})
	}

	PORT := os.Getenv("PORT")
	log.Fatal(http.ListenAndServe(":"+PORT, tusMiddleware(handler)))
}

func initializeORM() {
	dsn := fmt.Sprintf("%s:%s@tcp(%s:%s)/%s?charset=utf8mb4&parseTime=True&loc=Local",
		os.Getenv("DB_USERNAME"), os.Getenv("DB_PASSWORD"), os.Getenv("DB_HOST"),
		os.Getenv("DB_PORT"), os.Getenv("DB_DATABASE"))
	db, err := gorm.Open(mysql.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatalf("Failed to initialize GORM: %v", err)
	}
	orm.DB = db
	err = db.AutoMigrate(&model.User{}, &model.Department{}, &model.LoginHistory{},
		&model.WorkHours{}, &model.Role{}, &model.Contract{}, &model.Salary{}, &model.FileUpload{},
		&model.Calendar{}, &model.CalendarEvent{}, &model.Task{}, &model.Comment{},
		&model.Project{}, &model.EducationDetail{}, &model.EmergencyContact{}, &model.LeaveRequest{})
	if err != nil {
		log.Fatalf("Failed to migrate database models: %v", err)
	}
	log.Println("Database connection established")
}
