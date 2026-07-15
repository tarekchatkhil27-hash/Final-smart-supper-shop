package handlers

import (
	"ecommerce-backend/internal/database"
	"ecommerce-backend/internal/models"
	"ecommerce-backend/internal/storage"
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
)

// CreateProduct adds a new product to the catalog
func CreateProduct(c *gin.Context) {
	var input models.Product
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := database.DB.Create(&input).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create product"})
		return
	}

	c.JSON(http.StatusCreated, input)
}

// UpdateProduct updates an existing product's details or stock
func UpdateProduct(c *gin.Context) {
	id := c.Param("id")
	var product models.Product

	if err := database.DB.First(&product, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Product not found"})
		return
	}

	var input models.Product
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Update the allowed fields
	database.DB.Model(&product).Updates(models.Product{
		Name:        input.Name,
		Description: input.Description,
		Price:       input.Price,
		Stock:       input.Stock,
	})

	c.JSON(http.StatusOK, product)
}

// GetOrders retrieves all customer orders
func GetOrders(c *gin.Context) {
	var orders []models.Order
	
	// Preload the OrderItems to include the full order details
	if err := database.DB.Preload("Items").Find(&orders).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to retrieve orders"})
		return
	}

	c.JSON(http.StatusOK, orders)
}

// UploadProductImage handles uploading a product image to the configured storage service
func UploadProductImage(c *gin.Context) {
	id := c.Param("id")
	var product models.Product

	// Verify product exists
	if err := database.DB.First(&product, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Product not found"})
		return
	}

	// Make sure the storage service is initialized
	if storage.ActiveStorage == nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Storage service is not configured"})
		return
	}

	// Parse multipart form
	file, header, err := c.Request.FormFile("image")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Failed to get image from request: " + err.Error()})
		return
	}
	defer file.Close()

	// Generate a unique filename (e.g., productID-originalName)
	filename := fmt.Sprintf("%s-%s", id, header.Filename)
	contentType := header.Header.Get("Content-Type")

	// Upload using the interface
	url, err := storage.ActiveStorage.UploadImage(c.Request.Context(), file, filename, contentType)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to upload image: " + err.Error()})
		return
	}

	// Update the product record in the database
	database.DB.Model(&product).Update("image_url", url)

	c.JSON(http.StatusOK, gin.H{
		"message":   "Image uploaded successfully",
		"image_url": url,
	})
}
