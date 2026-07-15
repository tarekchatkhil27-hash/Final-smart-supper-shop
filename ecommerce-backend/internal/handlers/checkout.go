package handlers

import (
	"ecommerce-backend/internal/database"
	"ecommerce-backend/internal/models"
	"ecommerce-backend/internal/notifications"
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type CheckoutItem struct {
	ProductID uint `json:"product_id" binding:"required"`
	Quantity  int  `json:"quantity" binding:"required,min=1"`
}

type CheckoutRequest struct {
	CustomerEmail   string         `json:"customer_email" binding:"required,email"`
	CustomerAddress string         `json:"customer_address" binding:"required"`
	Items           []CheckoutItem `json:"items" binding:"required,min=1,dive"`
}

// Checkout handles the guest checkout process transactionally
func Checkout(c *gin.Context) {
	var req CheckoutRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request payload: " + err.Error()})
		return
	}

	var newOrder models.Order
	
	// Start a database transaction
	err := database.DB.Transaction(func(tx *gorm.DB) error {
		var totalAmount float64
		var orderItems []models.OrderItem

		// Process each item in the cart
		for _, itemReq := range req.Items {
			var product models.Product

			// Verify product exists and get its true price
			if err := tx.First(&product, itemReq.ProductID).Error; err != nil {
				return fmt.Errorf("product ID %d not found", itemReq.ProductID)
			}

			// Atomic update to prevent TOCTOU race conditions
			// This safely deducts stock only if there is sufficient quantity
			res := tx.Model(&product).Where("id = ? AND stock >= ?", product.ID, itemReq.Quantity).Update("stock", gorm.Expr("stock - ?", itemReq.Quantity))
			if res.Error != nil {
				return fmt.Errorf("failed to process stock for product: %s", product.Name)
			}
			if res.RowsAffected == 0 {
				return fmt.Errorf("insufficient stock for product: %s", product.Name)
			}

			// Calculate price for this line item
			lineItemPrice := product.Price * float64(itemReq.Quantity)
			totalAmount += lineItemPrice

			// Prepare OrderItem
			orderItems = append(orderItems, models.OrderItem{
				ProductID: product.ID,
				Quantity:  itemReq.Quantity,
				Price:     product.Price, // Capture historical price per unit
			})
		}

		// Create the parent Order
		newOrder = models.Order{
			CustomerEmail:   req.CustomerEmail,
			CustomerAddress: req.CustomerAddress,
			TotalPrice:      totalAmount,
			Status:          "pending",
			Items:           orderItems,
		}

		if err := tx.Create(&newOrder).Error; err != nil {
			return fmt.Errorf("failed to create order record")
		}

		// Transaction successful, return nil to commit
		return nil
	})

	if err != nil {
		// Transaction rolled back due to error
		c.JSON(http.StatusConflict, gin.H{"error": err.Error()})
		return
	}

	// Fire off webhook notification asynchronously
	notifications.SendOrderNotification(newOrder.ID, newOrder.TotalPrice)

	c.JSON(http.StatusCreated, gin.H{
		"message":  "Order placed successfully",
		"order_id": newOrder.ID,
	})
}
