package routes

import (
	"ecommerce-backend/controllers"
	"ecommerce-backend/middleware"

	"github.com/gin-gonic/gin"
)

func SetupRouter() *gin.Engine {
	r := gin.Default()

	// CORS Middleware (simplified for dev)
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

	v1 := r.Group("/api/v1")
	{
		// Public Routes
		v1.GET("/products", controllers.GetProducts)
		v1.GET("/products/:slug", controllers.GetProduct)
		v1.POST("/checkout", controllers.CreateOrder)
		
		// Admin Login
		v1.POST("/admin/login", controllers.Login)

		// Protected Admin Routes
		admin := v1.Group("/admin")
		admin.Use(middleware.AuthMiddleware())
		{
			// Product Management
			admin.POST("/products", controllers.CreateProduct)
			admin.PUT("/products/:id", controllers.UpdateProduct)
			admin.DELETE("/products/:id", controllers.DeleteProduct)

			// Order Management
			admin.GET("/orders", controllers.GetOrders)
			admin.PUT("/orders/:id/status", controllers.UpdateOrderStatus)
		}
	}

	return r
}
