package config

import (
	"log"
	"ecommerce-backend/models"

	"golang.org/x/crypto/bcrypt"
	"github.com/glebarez/sqlite"
	"gorm.io/gorm"
)

var DB *gorm.DB

func ConnectDatabase() {
	database, err := gorm.Open(sqlite.Open("sqlite.db"), &gorm.Config{})
	if err != nil {
		log.Fatal("Failed to connect to database!", err)
	}

	err = database.AutoMigrate(&models.Admin{}, &models.Product{}, &models.Order{}, &models.OrderItem{})
	if err != nil {
		log.Fatal("Failed to migrate database!", err)
	}

	DB = database

	seedAdmin()
}

func seedAdmin() {
	var admin models.Admin
	result := DB.Where("email = ?", "admin@sss.com").First(&admin)
	if result.Error != nil {
		// Admin doesn't exist, create it
		hash, _ := bcrypt.GenerateFromPassword([]byte("admin123"), bcrypt.DefaultCost)
		newAdmin := models.Admin{
			Email:        "admin@sss.com",
			PasswordHash: string(hash),
		}
		DB.Create(&newAdmin)
		log.Println("Seeded default admin user (admin@sss.com / admin123)")
	}
}
