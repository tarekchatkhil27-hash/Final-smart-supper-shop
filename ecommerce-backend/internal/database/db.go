package database

import (
	"log"

	"github.com/glebarez/sqlite"
	"gorm.io/gorm"
)

// DB is the global database instance
var DB *gorm.DB

// Connect initializes the SQLite database connection using GORM.
func Connect() {
	var err error
	// Using glebarez/sqlite which is a pure Go implementation of SQLite
	// This avoids CGO requirements on Windows.
	DB, err = gorm.Open(sqlite.Open("ecommerce.db"), &gorm.Config{})
	if err != nil {
		log.Fatalf("Failed to connect to the database: %v", err)
	}

	log.Println("Successfully connected to the SQLite database")
	
	// Migrations will be added here later
	// err = DB.AutoMigrate(...)
}
