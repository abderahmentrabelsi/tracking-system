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
	// Initialize the orm.DB instance
	initializeORM()

	//gin.SetMode(gin.ReleaseMode)

	// Create a new server instance
	srv := server.NewServer()

	// Get the router from the server
	router := srv.RegisterRoutes()

	// Wrap the router with CORS middleware
	corsConfig := cors.New(cors.Options{
		AllowedOrigins:   []string{"http://localhost:3000"}, // Replace with the origin of your client application
		AllowCredentials: true,
		AllowedMethods:   []string{"GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"},
		AllowedHeaders:   []string{"Origin", "Content-Length", "Content-Type", "Authorization"}, // Add "Authorization"
		MaxAge:           int(12 * time.Hour / time.Second),
	})
	handler := corsConfig.Handler(router)

	PORT := os.Getenv("PORT")
	// Start the server
	log.Fatal(http.ListenAndServe(":"+PORT, handler))
}

// initializeORM initializes the orm.DB instance
func initializeORM() {
	// Use the correct DSN format for MySQL connection string for GORM
	dsn := fmt.Sprintf("%s:%s@tcp(%s:%s)/%s?charset=utf8mb4&parseTime=True&loc=Local",
		os.Getenv("DB_USERNAME"), os.Getenv("DB_PASSWORD"), os.Getenv("DB_HOST"), os.Getenv("DB_PORT"), os.Getenv("DB_DATABASE"))

	// Open a new GORM connection
	db, err := gorm.Open(mysql.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatalf("Failed to initialize GORM: %v", err)
	}

	// Assign the GORM DB instance to orm.DB
	orm.DB = db

	// Auto migrate your models
	err = db.AutoMigrate(&models.User{}, &models.Department{}, &models.LoginHistory{}, &models.WorkHours{}, &models.TokenDetails{})
	if err != nil {
		log.Fatalf("Failed to migrate database models: %v", err)
	}

	log.Println("Database connection established")
}
