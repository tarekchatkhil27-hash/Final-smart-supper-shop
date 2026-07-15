package database

import (
	"ecommerce-backend/internal/models"
	"log"

	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"
)

// SeedDatabase auto-migrates models and seeds initial data if the database is empty
func SeedDatabase(db *gorm.DB) {
	log.Println("Running database migrations...")
	err := db.AutoMigrate(
		&models.Admin{},
		&models.Product{},
		&models.Order{},
		&models.OrderItem{},
	)
	if err != nil {
		log.Fatalf("Failed to migrate database: %v", err)
	}

	seedAdmin(db)
	seedProducts(db)
}

func seedAdmin(db *gorm.DB) {
	var count int64
	db.Model(&models.Admin{}).Count(&count)

	if count == 0 {
		hash, err := bcrypt.GenerateFromPassword([]byte("hashed_admin_password_123"), bcrypt.DefaultCost)
		if err != nil {
			log.Fatalf("Failed to hash seed password: %v", err)
		}

		admin := models.Admin{
			Username:     "admin",
			PasswordHash: string(hash), 
		}
		db.Create(&admin)
		log.Println("Seeded default admin user")
	}
}

func seedProducts(db *gorm.DB) {
	var count int64
	db.Model(&models.Product{}).Count(&count)

	if count == 0 {
		products := []models.Product{
			{Name: "Fresh Apples", Description: "Crisp red apples, locally sourced.", Price: 2.50, Stock: 100},
			{Name: "Whole Milk 1L", Description: "Organic whole milk from free-range cows.", Price: 1.20, Stock: 50},
			{Name: "Sourdough Bread", Description: "Freshly baked artisan sourdough loaf.", Price: 3.00, Stock: 20},
			{Name: "Free Range Eggs (Dozen)", Description: "Farm fresh free-range eggs.", Price: 4.50, Stock: 30},
			{Name: "Organic Bananas", Description: "Sweet and ripe organic bananas.", Price: 1.80, Stock: 150},
		}
		
		for _, p := range products {
			db.Create(&p)
		}
		log.Println("Seeded 5 default products")
	}
}
