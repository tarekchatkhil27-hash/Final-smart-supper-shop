package controllers

import (
	"ecommerce-backend/config"
	"ecommerce-backend/models"
	"net/http"

	"github.com/gin-gonic/gin"
)

// GetProducts returns all products, optionally filtered by category
func GetProducts(c *gin.Context) {
	var products []models.Product
	category := c.Query("category")

	query := config.DB
	if category != "" {
		query = query.Where("category = ?", category)
	}

	query.Find(&products)
	c.JSON(http.StatusOK, products)
}

// GetProduct returns a single product by slug
func GetProduct(c *gin.Context) {
	slug := c.Param("slug")
	var product models.Product

	if err := config.DB.Where("slug = ?", slug).First(&product).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Product not found"})
		return
	}

	c.JSON(http.StatusOK, product)
}

// CreateProduct adds a new product (Admin only)
func CreateProduct(c *gin.Context) {
	var input models.Product
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := config.DB.Create(&input).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create product"})
		return
	}

	c.JSON(http.StatusCreated, input)
}

// UpdateProduct modifies an existing product (Admin only)
func UpdateProduct(c *gin.Context) {
	id := c.Param("id")
	var product models.Product

	if err := config.DB.First(&product, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Product not found"})
		return
	}

	var input models.Product
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Protect ID and Slug from being overwritten accidentally if omitted in JSON
	config.DB.Model(&product).Updates(input)
	c.JSON(http.StatusOK, product)
}

// DeleteProduct removes a product (Admin only)
func DeleteProduct(c *gin.Context) {
	id := c.Param("id")
	var product models.Product

	if err := config.DB.First(&product, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Product not found"})
		return
	}

	config.DB.Delete(&product)
	c.JSON(http.StatusOK, gin.H{"message": "Product deleted successfully"})
}
