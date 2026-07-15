package main

import (
	"ecommerce-backend/internal/database"
	"ecommerce-backend/internal/handlers"
	"ecommerce-backend/internal/middleware"
	"ecommerce-backend/internal/storage"
	"log"

	"github.com/gin-gonic/gin"
)

func main() {
	// Initialize the Database
	database.Connect()
	
	// Auto-migrate and seed
	database.SeedDatabase(database.DB)

	// Start the automated backup worker in the background
	database.StartBackupWorker()

	// Initialize S3 Storage (assuming env vars are injected)
	s3Storage, err := storage.NewS3Storage()
	if err != nil {
		log.Printf("Warning: S3 Storage not configured: %v", err)
	} else {
		storage.ActiveStorage = s3Storage
		log.Println("S3 Image Storage configured successfully")
	}

	// Set up the Gin router
	r := gin.Default()

	// Standard CORS middleware
	r.Use(func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT, DELETE")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}
		c.Next()
	})

	// Define API routes
	api := r.Group("/api")
	{
		api.GET("/health", handlers.HealthCheck)
		api.GET("/products", handlers.GetProducts)
		api.GET("/products/:id", handlers.GetProduct)
		api.POST("/checkout", handlers.Checkout)
		
		// Admin Login
		api.POST("/admin/login", handlers.AdminLogin)

		// Protected Admin Routes
		admin := api.Group("/admin")
		admin.Use(middleware.AuthRequired())
		{
			admin.POST("/products", handlers.CreateProduct)
			admin.PUT("/products/:id", handlers.UpdateProduct)
			admin.POST("/products/:id/image", handlers.UploadProductImage)
			admin.GET("/orders", handlers.GetOrders)
		}
	}

	// Start the server
	log.Println("Starting Go backend server on port 8080...")
	if err := r.Run(":8080"); err != nil {
		log.Fatalf("Server failed to start: %v", err)
	}
}
