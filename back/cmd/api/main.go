package main

import (
	"back/internal/model"
	"back/internal/server"
	"fmt"
	"gorm.io/driver/mysql" // This is the correct import path for GORM's MySQL driver
	"gorm.io/gorm"
	"log"
	"os"
)

func main() {
	server := server.NewServer()

	// Use the correct DSN format for MySQL connection string for GORM
	dsn := fmt.Sprintf("%s:%s@tcp(%s:%s)/%s?charset=utf8mb4&parseTime=True&loc=Local",
		os.Getenv("DB_USERNAME"), os.Getenv("DB_PASSWORD"), os.Getenv("DB_HOST"), os.Getenv("DB_PORT"), os.Getenv("DB_DATABASE"))

	db, err := gorm.Open(mysql.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatalf("Failed to initialize GORM: %v", err)
	}

	// Auto migrate your models
	err = db.AutoMigrate(&models.User{}, &models.Department{}, &models.LoginHistory{}, &models.WorkHours{}, &models.TokenDetails{})
	if err != nil {
		log.Fatalf("Failed to migrate database models: %v", err)
	}

	err = server.ListenAndServe()
	if err != nil {
		panic(fmt.Sprintf("cannot start server: %s", err))
	}
}
