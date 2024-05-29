package main

import (
	"back/internal/model"
	"back/internal/orm" // Import the orm package
	"back/internal/server"
	"fmt"
	"github.com/rs/cors"
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
	corsConfig := cors.New(cors.Options{
		AllowedOrigins:   []string{"http://localhost:3000"}, // Replace with the origin of your client application
		AllowCredentials: true,
		AllowedMethods:   []string{"GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"},
		AllowedHeaders:   []string{"Origin", "Content-Length", "Content-Type", "Authorization"}, // Add "Authorization"
		MaxAge:           int(12 * time.Hour / time.Second),
	})
	handler := corsConfig.Handler(router)

	PORT := os.Getenv("PORT")
	log.Fatal(http.ListenAndServe(":"+PORT, handler))
}

func initializeORM() {
	dsn := fmt.Sprintf("%s:%s@tcp(%s:%s)/%s?charset=utf8mb4&parseTime=True&loc=Local", os.Getenv("DB_USERNAME"), os.Getenv("DB_PASSWORD"), os.Getenv("DB_HOST"), os.Getenv("DB_PORT"), os.Getenv("DB_DATABASE"))
	db, err := gorm.Open(mysql.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatalf("Failed to initialize GORM: %v", err)
	}
	orm.DB = db
	err = db.AutoMigrate(&models.User{}, &models.Department{}, &models.LoginHistory{}, &models.WorkHours{}, &models.TokenDetails{}, &models.Role{}, &models.Permission{}, &models.RolePermission{}, &models.Contract{}, &models.Salary{}, &models.FileUpload{})
	if err != nil {
		log.Fatalf("Failed to migrate database models: %v", err)
	}
	log.Println("Database connection established")
}
