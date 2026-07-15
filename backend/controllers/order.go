package controllers

import (
	"ecommerce-backend/config"
	"ecommerce-backend/models"
	"net/http"

	"github.com/gin-gonic/gin"
)

type CheckoutInput struct {
	CustomerName string `json:"customerName" binding:"required"`
	Phone        string `json:"phone" binding:"required"`
	Address      string `json:"address" binding:"required"`
	Items        []struct {
		ProductID uint    `json:"productId" binding:"required"`
		Quantity  int     `json:"quantity" binding:"required"`
		Price     float64 `json:"price" binding:"required"`
	} `json:"items" binding:"required,dive"`
}

// CreateOrder handles guest checkout
func CreateOrder(c *gin.Context) {
	var input CheckoutInput
	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	var totalAmount float64
	var orderItems []models.OrderItem

	for _, item := range input.Items {
		totalAmount += item.Price * float64(item.Quantity)
		orderItems = append(orderItems, models.OrderItem{
			ProductID: item.ProductID,
			Quantity:  item.Quantity,
			Price:     item.Price,
		})
	}

	order := models.Order{
		CustomerName: input.CustomerName,
		Phone:        input.Phone,
		Address:      input.Address,
		TotalAmount:  totalAmount,
		Status:       "pending",
		Items:        orderItems,
	}

	if err := config.DB.Create(&order).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create order"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"message": "Order placed successfully", "orderId": order.ID})
}

// GetOrders returns all orders (Admin only)
func GetOrders(c *gin.Context) {
	var orders []models.Order
	// Preload items to include order details
	if err := config.DB.Preload("Items").Order("created_at desc").Find(&orders).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch orders"})
		return
	}

	c.JSON(http.StatusOK, orders)
}

// UpdateOrderStatus modifies order status (Admin only)
func UpdateOrderStatus(c *gin.Context) {
	id := c.Param("id")
	var order models.Order

	if err := config.DB.First(&order, id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Order not found"})
		return
	}

	var input struct {
		Status string `json:"status" binding:"required"`
	}

	if err := c.ShouldBindJSON(&input); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	order.Status = input.Status
	config.DB.Save(&order)

	c.JSON(http.StatusOK, order)
}
