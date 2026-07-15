package main

import (
	"ecommerce-backend/config"
	"ecommerce-backend/routes"
	"log"
)

func main() {
	// Initialize Database and run migrations
	config.ConnectDatabase()

	// Setup Router
	r := routes.SetupRouter()

	log.Println("Starting server on :8080")
	if err := r.Run(":8080"); err != nil {
		log.Fatal("Server failed to start:", err)
	}
}
