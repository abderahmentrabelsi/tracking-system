package main

import (
	"back/internal/model"
	"back/internal/orm" // Import the orm package
	"back/internal/server"
	"fmt"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
	"log"
	"os"
)

func main() {
	// Initialize the orm.DB instance
	initializeORM()

	// Create a new server instance
	server := server.NewServer()

	// Start the server
	err := server.ListenAndServe()
	if err != nil {
		panic(fmt.Sprintf("cannot start server: %s", err))
	}
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
