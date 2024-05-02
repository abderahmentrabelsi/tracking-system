package database

import (
	"context"
	"database/sql"
	"fmt"
	"log"
	"os"
	"time"

	_ "github.com/go-sql-driver/mysql"
	_ "github.com/joho/godotenv/autoload"
)

type Service interface {
	Health() map[string]string
	DB() *sql.DB
}

type service struct {
	db *sql.DB
}

var (
	dbname     = os.Getenv("DB_DATABASE")
	password   = os.Getenv("DB_PASSWORD")
	username   = os.Getenv("DB_USERNAME")
	port       = os.Getenv("DB_PORT")
	host       = os.Getenv("DB_HOST")
	dbInstance *service
)

func ensureDatabaseExists() {
	// Connection string without the database name
	baseDsn := fmt.Sprintf("%s:%s@tcp(%s:%s)/", username, password, host, port)
	db, err := sql.Open("mysql", baseDsn)
	if err != nil {
		log.Fatalf("Failed to connect to MySQL: %v", err)
	}
	defer db.Close()

	_, err = db.Exec("CREATE DATABASE IF NOT EXISTS " + dbname)
	if err != nil {
		log.Fatalf("Failed to create database: %v", err)
	}

	log.Println("Database checked/created successfully")
}

func New() Service {
	if dbInstance != nil {
		return dbInstance
	}

	ensureDatabaseExists()

	// DSN with the database name included
	dsn := fmt.Sprintf("%s:%s@tcp(%s:%s)/%s?parseTime=true", username, password, host, port, dbname)
	db, err := sql.Open("mysql", dsn)
	if err != nil {
		log.Fatalf("Error on initializing database connection: %s", err)
	}

	db.SetConnMaxLifetime(0)
	db.SetMaxIdleConns(50)
	db.SetMaxOpenConns(50)

	err = db.Ping()
	if err != nil {
		log.Fatalf("Error on opening database connection: %s", err)
	} else {
		log.Println("Database connection established")
	}

	dbInstance = &service{
		db: db,
	}
	return dbInstance
}

func (s *service) Health() map[string]string {
	ctx, cancel := context.WithTimeout(context.Background(), 1*time.Second)
	defer cancel()

	err := s.db.PingContext(ctx)
	if err != nil {
		log.Fatalf("DB down: %v", err)
	}

	return map[string]string{
		"message": "It's healthy",
	}
}

func (s *service) DB() *sql.DB {
	return s.db
}
